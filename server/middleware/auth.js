const jwt = require("jsonwebtoken");
const User = require("../models/User");

// AUTHENTICAATION MIDDLEWARE===============================

const protect = async (req, res, next) => {
  let token =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

  if (token) {
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decode.id).select("password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorization, user not found" });
      }
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Not authorization, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorization, no token" });
  }
};


// ADMIN ==============MIDDLEWRE===============

const admin = (req,res,next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({message:"Forbidden, admin acess required"})
  }
}

module.exports = {protect, admin}