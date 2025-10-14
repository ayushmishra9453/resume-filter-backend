// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({ 
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail({ to, subject, html }) {
  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
}

module.exports = sendMail;
