const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("./middleware");

router.get("/admin-dashboard", verifyToken, isAdmin, (req, res) => {
  res.json({ message: `Welcome Admin: ${req.user.email}` });
});

module.exports = router;
