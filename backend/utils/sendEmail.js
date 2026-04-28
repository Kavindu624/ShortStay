const transporter = require('../config/email');

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"ShortStay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email failed:', err.message);
  }
};

module.exports = sendEmail;