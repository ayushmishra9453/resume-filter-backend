const express=require('express')
const app=express();
const cookieParser=require('cookie-parser')
const session=require('express-session')
require('dotenv').config()
const passport=require('passport')
const googleStrategy=  require('passport-google-oauth20').Strategy;
const PORT=process.env.PORT || 4000;
const resumeRoutes=require('./routes/resumeRoutes')
const connectWithDB=require('./config/database');
// const googleAuth=require('./middlewares/googleAuth')
const { log, profile } = require('node:console');
const userRoutes=require('./routes/userRoutes')
const cors=require('cors')
const googleAuthLogin = require('./middlewares/googleAuthLogin');
const googleAuthRegister = require('./middlewares/googleAuthRegister');
const errorHandler=require('./middlewares/errorHandler')
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())
connectWithDB();
// passport.use(new gooleStrategy({
//     clientID:process.env.GOOGLE_CLIENT_ID,
//     clientSecret:process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL:"http://localhost:4000/auth/google/callback"
// },(accessToken,refreshToken,profile,done)=> {
//     return done(null,profile);
// }))

// passport.serializeUser((user,done)=>{
//     done(null,user);
// })
// passport.deserializeUser((user,done)=>{
//     done(null,user);
// })

// app.get('/auth/google',passport.authenticate('google',{
//     scope:['email','profile'],
//     prompt:'select_account'
// }))

// app.get('/auth/google/callback',passport.authenticate('google',{
//     failureRedirect:'http://localhost:5173/login'
// }),
// googleAuth,(req,res,next)=>{
//     res.redirect('http://localhost:5173/')
// })

// ---- GOOGLE STRATEGY SETUP ----
passport.use('google-login', new googleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_LOGIN_CALLBACK
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.use('google-register', new googleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REGISTER_CALLBACK
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// -------- LOGIN FLOW ----------
app.get('/auth/google/login',
  passport.authenticate('google-login', { scope: ['email', 'profile'], prompt: 'select_account' })
);

app.get('/auth/google/login/callback',
  passport.authenticate('google-login', { failureRedirect: 'http://localhost:5173/login' }),
  googleAuthLogin,
  (req, res) => {
    res.redirect('http://localhost:5173/');
  }
);

// -------- REGISTER FLOW ----------
app.get('/auth/google/register',
  passport.authenticate('google-register', { scope: ['email', 'profile'], prompt: 'select_account' })
);

app.get('/auth/google/register/callback',
  passport.authenticate('google-register', { failureRedirect: 'http://localhost:5173/register' }),
  googleAuthRegister,
  (req, res) => {
    res.redirect('http://localhost:5173/');
  }
);


app.use(cookieParser())
app.use("/api/resumes", resumeRoutes);
app.use("/api/user",userRoutes)

app.use(errorHandler)

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

app.get("/",(req,res)=>{
    res.send(`<h1>This is your home page <h2>`)
})