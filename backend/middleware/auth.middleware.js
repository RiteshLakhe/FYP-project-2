const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const Admin = require("../model/admin.model");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id).select("-password");

    if (!user) {
      user = await Admin.findById(decoded.id).select("-password");
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id).select("-password");

    if (!user) {
      user = await Admin.findById(decoded.id).select("-password");
    }

    if (user) {
      req.user = user;
    }

    next();
  } catch (err) {
    next();
  }
};

const checkVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      message: "Authentication required",
    });
  }

  if (req.user.roles === "admin") {
    return next();
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      message: "Verify your email before posting properties",
    });
  }
  
  next();
};

const hasRole = (user, role) => {
  if (!user?.roles) return false;
  return Array.isArray(user.roles)
    ? user.roles.includes(role)
    : user.roles === role;
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (!hasRole(req.user, "admin")) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }

  next();
};

module.exports = { protect, optionalProtect, checkVerified, requireAdmin, hasRole };
