const express = require('express');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');


// import the model

const resume=require('../model/resume')


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
function countOccurrences(text, keyword) {
  if (!text || !keyword) return 0;
  const r = new RegExp(escapeRegex(keyword), 'gi');
  const matches = text.match(r);
  return matches ? matches.length : 0;
}


// Text extraction
// Extract text from uploaded files
const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    const data = fs.readFileSync(filePath);
    const parsed = await pdfParse(data);
    return parsed.text || "";
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  } else if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf8");
  } else {
    throw new Error("Unsupported file type: " + ext);
  }
};

// @desc Upload resume
// @route POST /api/resumes/upload
exports.uploadResume = async (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const { name, email, skills = "", experience = "" } = req.body;
    const skillsArr = skills.split(",").map((s) => s.trim()).filter(Boolean);

    const resumeText = await extractText(file.path);

    const doc = new resume({
      name,
      email,
      skills: skillsArr,
      experience,
      resumeText,
      filePath: file.path,
    });

    await doc.save();
    res.json({ success: true, id: doc._id });
  } catch (err) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};

// @desc Search resumes by keywords
// @route GET /api/resumes/search?q=keyword1,keyword2
exports.searchResumes = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) return res.json({ results: [] });

    const keywords = q.split(/,|\s+/).map((s) => s.trim()).filter(Boolean);
    if (keywords.length === 0) return res.json({ results: [] });

    const orQueries = [];
    for (const kw of keywords) {
      const r = new RegExp(escapeRegex(kw), "i");
      orQueries.push({ resumeText: { $regex: r } });
      orQueries.push({ skills: { $in: [r] } });
      orQueries.push({ experience: { $regex: r } });
      orQueries.push({ name: { $regex: r } });
    }

    const candidates = await resume.find({ $or: orQueries }).limit(200).lean();

    const results = candidates.map((doc) => {
      const hay =
        (doc.resumeText || "") +
        " " +
        (doc.skills || []).join(" ") +
        " " +
        (doc.experience || "") +
        " " +
        (doc.name || "");
      let score = 0;
      for (const kw of keywords) score += countOccurrences(hay, kw);

      let snippet = "";
      const text = doc.resumeText || "";
      let firstPos = -1;
      for (const kw of keywords) {
        const pos = text.toLowerCase().indexOf(kw.toLowerCase());
        if (pos >= 0 && (firstPos === -1 || pos < firstPos)) firstPos = pos;
      }
      if (firstPos >= 0) {
        const start = Math.max(0, firstPos - 80);
        snippet = text.substring(start, Math.min(text.length, firstPos + 120));
      } else {
        snippet = (text || "").substring(0, 200);
      }

      return {
        id: doc._id,
        name: doc.name,
        email: doc.email,
        skills: doc.skills,
        experience: doc.experience,
        filePath: doc.filePath,
        score,
        snippet,
      };
    });

    results.sort((a, b) => b.score - a.score);

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message || "Search failed" });
  }
};