const express = require("express");
const router = express.Router();
const HR = require("../models/HR");


router.get("/email/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const hr = await HR.findOne({ where: { email } });
    if (!hr) return res.status(404).json({ message: "HR not found" });
    res.json({ name: hr.name });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Add HR
router.post("/add", async (req, res) => {
  try {
    const newHR = await HR.create(req.body);
    res.status(201).json({ message: "HR added successfully!", hr: newHR });
  } catch (error) {
    res.status(500).json({ message: "Error adding HR", error: error.message });
  }
});

// Get all HR's
router.get("/fetch", async (req, res) => {
  try {
    const hrList = await HR.findAll();
    res.status(200).json(hrList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching HR list", error: error.message });
  }
});

// Update HR (Edit + Save)
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await HR.update(req.body, {
      where: { id },
    });

    if (updated) {
      const updatedHR = await HR.findByPk(id);
      res.status(200).json({ message: "HR updated successfully!", hr: updatedHR });
    } else {
      res.status(404).json({ message: "HR not found for update" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating HR", error: error.message });
  }
});


module.exports = router;


