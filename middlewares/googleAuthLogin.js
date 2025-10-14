const User = require('../model/User');
const { generateToken } = require('./auth');

const googleAuthLogin = async (req, res, next) => {
  try {
    const email = req.user?._json?.email;
    if (!email) return res.status(400).json({ message: 'Google email not found' });

    const findUser = await User.findOne({ email });
    if (!findUser) {
      // ❌ Not registered — block login
      return res.redirect('http://localhost:5173/login?error=not_registered');
    }

    // ✅ Existing user — log in
    const token = generateToken(email);
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: false, // set true in production
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000
    });

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Google login error' });
  }
};

module.exports = googleAuthLogin;
