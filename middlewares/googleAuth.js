const User=require('../model/User')
const generateToken=require('./auth')
const googleAuth=async(req, res,next)=>{
  try{
  const findUser=await User.findOne({email:req.user?._json?.email})
  let savedUser;
  if(!findUser){
    const newUser= new User({
     name:req.user?._json?.name,
     email:req.user?._json?.email
    })
     savedUser=await newUser.save()
       
  }
  const accessToken=generateToken(findUser?findUser.email : savedUser.email)
  res.cookie("accessToken",accessToken,{
    httpOnly:true,
    secure:true,
    sameSite: "none",
  })
  next();
  }
  catch(error){
   next(error)
  }
    
}

module.exports=googleAuth;