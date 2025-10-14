const User = require('../model/User');
const { generateToken } = require('./auth');

const googleAuthRegister = async (req, res, next) => {
  try {
    const email = req.user?._json?.email;
    const name = req.user?._json?.name;
    const picture = req.user?._json?.picture;

    if (!email) return res.status(400).json({ message: 'Google email not found' });

    let findUser = await User.findOne({ email });

    if (!findUser) {
      // ✅ Create new user for registration
      findUser = await User.create({
        name,
        email,
        password: 'google-auth', // dummy password (not used)
        profilePicture: picture
      });
    }

    const token = generateToken(email);
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000
    });

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Google registration error' });
  }
};

module.exports = googleAuthRegister;
