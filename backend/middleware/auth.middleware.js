const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) return res.status(401).json({ message: "User not found" });
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const checkVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      message: "Authentication required",
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      message: "Verify your email before posting properties",
    });
  }
  
  next();
};


module.exports = { protect, checkVerified };