require("dotenv").config();
const jwt = require("jsonwebtoken");

const EXPIRES_IN = "7d"; 

const generateToken = (payload) => {
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        throw new Error("JWT_SECRET is missing in backend/.env");
    }

    return jwt.sign(payload, secretKey, {
        expiresIn: EXPIRES_IN,
    });
};

module.exports = { generateToken };
