const jwt = require("jsonwebtoken");

// ✅ Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Improved extraction
  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Contains email, role, id
    console.log("✅ Decoded User:", req.user); // Debugging
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Role-Based Access Middleware
const isAdmin = (req, res, next) => {
  console.log("🔍 Checking Admin Role:", req.user.role);
  if (req.user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

const isHR = (req, res, next) => {
  console.log("🔍 Checking HR Role:", req.user.role);
  if (req.user.role.toLowerCase() !== "hr") {
    return res.status(403).json({ message: "Access denied: HR only" });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isHR };
