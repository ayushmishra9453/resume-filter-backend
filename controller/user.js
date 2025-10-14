const {generateToken} = require("../middlewares/auth");
const User = require("../model/User");
const userService = require("../service/userService")
const bcrypt = require("bcrypt");
exports.register = async (req, res, next) => {
  const { name, email, password, confirmPassword, contact_number } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const error = new Error("User is already registered");
      error.statusCode = 400;
      throw error;
    }
    if (password !== confirmPassword) {
      const error = new Error("Password and Confirm Password are not same");
      error.statusCode = 400;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contact_number,
    });

    const savedUser = await newUser.save();
    res.status(200).json({
      message: "User Registered Successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      const error = new Error("no user found");
      error.statusCode = 400;
      throw error;
    }

    const isPassMatch = await bcrypt.compare(password, findUser.password);
    if (!isPassMatch) {
      const error = new Error("incorrect password");
      error.statusCode = 400;
      throw error;
    }

    const accessToken = generateToken(findUser.email);
    res.cookie("accessToken", accessToken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({message:'success',status:true})
  } catch (error) {
    next(error)
  }
};

exports.getUser=async(req,res,next)=>{
    const email=req.email;
    try{
      const findUser=await User.findOne({email:email})
      res.status(200)
      .json({
        message:"success",
        status:true,
        user:{name:findUser.name, email:findUser.email},
      })
    }
    catch(error){
        next(error)
    }
}

exports.logout=async(req,res,next)=>{
    res.clearCookie('connect.sid')
    res.clearCookie('accessToken')
    res.status(200).json({
        message:'success',
        status:true
    })
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await userService.sendResetEmail(email);
    res.status(200).json({ message: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const response = await userService.resetPassword(token, newPassword);
    res.status(200).json({ message: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};