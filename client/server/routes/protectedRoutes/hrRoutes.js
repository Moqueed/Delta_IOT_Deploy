const express = require("express");
const router = express.Router();
const { verifyToken, isHR } = require("./middleware");

router.get("/hr-dashboard", verifyToken, isHR, (req, res) => {
  res.json({ message: `Welcome HR: ${req.user.email}` });
});

module.exports = router;
