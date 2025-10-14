const express=require('express')
const user=require('../controller/user.js');
const { auth } = require('../middlewares/auth.js');
const getAccess=require('../controller/getAccess.js')
const router=express.Router();
router.post('/login',user.login)
router.post('/register',user.register)
router.get('/getUser',auth,user.getUser)
router.get('/logout',user.logout)
router.get('/access',auth,getAccess)

// Facebook Login
// router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
// router.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: process.env.FRONTEND_URL + "/login" }),
//   (req, res) => {
//     res.cookie("accessToken", req.user.token, {
//       sameSite: "none",
//       httpOnly: true,
//       secure: true,
//     });
//     res.redirect(process.env.FRONTEND_URL + "/home");
//   }
// );

// // LinkedIn Login
// router.get("/auth/linkedin", passport.authenticate("linkedin", { state: "SOME STATE" }));
// router.get(
//   "/auth/linkedin/callback",
//   passport.authenticate("linkedin", { failureRedirect: process.env.FRONTEND_URL + "/login" }),
//   (req, res) => {
//     res.cookie("accessToken", req.user.token, {
//       sameSite: "none",
//       httpOnly: true,
//       secure: true,
//     });
//     res.redirect(process.env.FRONTEND_URL + "/home");
//   }
// );
module.exports=router