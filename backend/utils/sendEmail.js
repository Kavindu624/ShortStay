const transporter = require('../config/email');

const sendEmail = (to, subject, html) => {
  transporter.sendMail({
    from: `"ShortStay" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
  .then(() => console.log(`Email sent to ${to}`))
  .catch(err => console.error('Email failed:', err.message));
};

module.exports = sendEmail;