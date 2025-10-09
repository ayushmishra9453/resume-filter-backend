const express=require('express')
const app=express();
const cookieParser=require('cookie-parser')
const session=require('express-session')
require('dotenv').config()
const passport=require('passport')
const gooleStrategy=  require('passport-google-oauth20').Strategy;
const PORT=process.env.PORT || 4000;
const resumeRoutes=require('./routes/resumeRoutes')
const connectWithDB=require('./config/database');
const googleAuth=require('./middlewares/googleAuth')
const { log, profile } = require('node:console');
const userRoutes=require('./routes/userRoutes')
const cors=require('cors')
const errorHandler=require('./middlewares/errorHandler')
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())
connectWithDB();
passport.use(new gooleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:5000/auth/google/callback"
},
(accessToken,refreshToken,profile,done)=> {
    return done(null,profile);
}))

passport.serializeUser((user,done)=>{
    done(null,user);
})
passport.deserializeUser((user,done)=>{
    done(null,user);
})

app.get('/auth/google',passport.authenticate('google',{
    scope:['email','profile'],
    prompt:'select_account'
}))

app.get('/auth/google/callback',passport.authenticate('google',{
    failureRedirect:'http://localhost:3000/login'
}),
googleAuth,(req,res,next)=>{
    res.redirect('http://localhost:3000')
})
app.use(cookieParser())
app.use("/api/resumes", resumeRoutes);
app.use("/api/user",userRoutes)

app.use(errorHandler)

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

app.get("/",(req,res)=>{
    res.send(`<h1>This is your home page <h2>`)
})