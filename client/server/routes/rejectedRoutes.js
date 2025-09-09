const express = require("express");
const router = express.Router();
const Rejected = require("../models/Rejected");

// 🔹 Fetch Rejected List
router.get("/fetch", async (req, res) => {
  try {
    const rejectedCandidates = await Rejected.findAll({
      order: [["status_date", "DESC"]],
    });
    res.status(200).json(rejectedCandidates);
  } catch (error) {
    console.error("❌ Error fetching rejected data:", error);
    res.status(500).json({ message: "Failed to fetch rejected data" });
  }
});

module.exports = router;
