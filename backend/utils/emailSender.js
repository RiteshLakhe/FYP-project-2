const nodemailer = require("nodemailer");
require("dotenv").config();

const isEmailConfigured = Boolean(
  process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD
);

let transporter = null;

if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Verify connection on startup
    transporter.verify((error, success) => {
      if (error) {
        console.warn("Email transporter verification failed:", error.message);
        console.warn("Emails will be skipped. Check your EMAIL_USER and EMAIL_APP_PASSWORD in .env");
      } else {
        console.log("Email transporter is ready");
      }
    });
  } catch (error) {
    console.warn("Failed to create email transporter:", error.message);
    transporter = null;
  }
}

const sendMail = async (mailOptions) => {
  if (!transporter) {
    console.log("Email not configured or failed to initialize. Skipping email send:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    return { skipped: true };
  }

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Email send failed:", error.message);
    throw error;
  }
};

module.exports = { transporter, sendMail, isEmailConfigured };
