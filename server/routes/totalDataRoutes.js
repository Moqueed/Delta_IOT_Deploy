const express = require("express");
const {
  AboutToJoin,
  NewlyJoined,
  BufferData,
  TotalMasterData,
} = require("../models/TotalData");
const router = express.Router();

// ✅ Get all data from Total Master Data
router.get("/total-master-data/fetch", async (req, res) => {
  try {
    const data = await TotalMasterData.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Total Master Data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all data from About To Join
router.get("/about-to-join/fetch", async (req, res) => {
  try {
    const data = await AboutToJoin.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching About To Join Data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all data from Newly Joined
router.get("/newly-joined/fetch", async (req, res) => {
  try {
    const data = await NewlyJoined.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Newly Joined Data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all data from Buffer Data
router.get("/buffer-data/fetch", async (req, res) => {
  try {
    const data = await BufferData.findAll();
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Buffer Data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
