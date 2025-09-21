const express=require('express')
const app=express();
require('dotenv').config()
const PORT=process.env.PORT || 4000;
app.use(express.json())
const resumeRoutes=require('./routes/resumeRoutes')
const connectWithDB=require('./config/database');
const { log } = require('node:console');
const cors=require('cors')
connectWithDB();
app.use(cors());
app.use(express.json())
app.use("/api/resumes", resumeRoutes);
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

app.get("/",(req,res)=>{
    res.send(`<h1>This is your home page <h2>`)
})