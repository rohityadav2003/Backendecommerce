// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

const blacklistedTokens = new Set();
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: "Token is blacklisted" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user =userData; // this will contain userId and email
    next();
  });
};
const generateToken=(userData)=>{
  return jwt.sign(userData,process.env.JWT_SECRET);
}

module.exports = { verifyToken,generateToken };
