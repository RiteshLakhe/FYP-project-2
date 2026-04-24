const buildOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const getOtpExpiry = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

const buildOtpEmail = ({ fullname, otp, purpose }) => {
  const heading =
    purpose === "login" ? "Your RentEase login verification code" : "Verify your RentEase account";
  const intro =
    purpose === "login"
      ? "Use the code below to complete your sign in."
      : "Use the code below to complete your sign up.";

  return {
    subject: heading,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>${heading}</h2>
        <p>Hello ${fullname || "there"},</p>
        <p>${intro}</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };
};

module.exports = { buildOtp, getOtpExpiry, buildOtpEmail };
