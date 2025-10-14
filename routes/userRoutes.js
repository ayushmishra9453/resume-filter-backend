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

// Forgot password routes
router.post('/forgot-password', user.forgotPassword);
router.post('/reset-password/:token', user.resetPassword);
module.exports=router