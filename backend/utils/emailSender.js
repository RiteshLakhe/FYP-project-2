const nodemailer = require("nodemailer");
require("dotenv").config();

const isEmailConfigured = Boolean(
  process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD
);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })
  : null;

const sendMail = async (mailOptions) => {
  if (!isEmailConfigured) {
    console.log("Email not configured. Skipping email send:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    return { skipped: true };
  }

  return transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendMail, isEmailConfigured };
