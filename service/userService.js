// services/userService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/User')
const sendMail = require('../utility/mailer');
const { login } = require('../controller/user');

exports.sendResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // Create reset token valid for 15 minutes
  const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '15m' });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  // Send email
  await sendMail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>Hi ${user.name || ''},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `
  });

  return 'Password reset email sent successfully.';
};

exports.resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('Invalid or expired token');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return 'Password reset successfully.';
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};
