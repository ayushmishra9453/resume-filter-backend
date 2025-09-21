const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadResume,
  searchResumes,
} = require("../controller/resumeController");

const router = express.Router();

// Setup multer (local storage for now)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// Routes
router.post("/upload", upload.single("file"), uploadResume);
router.get("/search", searchResumes);

module.exports = router;
