const express = require("express");
const { ActivePosition } = require("../models");
const sendPositionMail = require("../utils/emailHelper");
const sendNotification = require("../utils/sendNotification");
const router = express.Router();

//Send Mail
router.post("/send-position-mail", async (req, res) => {
  const { hrEmail, positionTitle, positionDescription } = req.body;

  try {
    await sendPositionMail(hrEmail, positionTitle, positionDescription);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

//Create a active position
router.post("/add-position", async (req, res) => {
  try {
    console.log("🛠️ Received data:", req.body);
    const {
      position,
      skills,
      department,
      vacancy,
      minimum_experience,
      maximum_experience,
      job_description,
      HRs,
    } = req.body;

    // Auto-convert string to array if needed
    const formattedSkills = Array.isArray(skills)
      ? skills
      : skills.split(",").map((s) => s.trim()) || [];
    const formattedHRs = Array.isArray(HRs)
      ? HRs
      : HRs.split(",").map((h) => h.trim()) || [];

    // Ensure all fields are provided and arrays aren't empty
    if (
      !position ||
      !formattedSkills.length ||
      !department ||
      !vacancy == null ||
      !minimum_experience == null ||
      !maximum_experience == null ||
      !job_description ||
      !formattedHRs.length
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPosition = await ActivePosition.create({
      position,
      skills: formattedSkills,
      department,
      vacancy,
      minimum_experience,
      maximum_experience,
      job_description,
      HRs: formattedHRs,
    });

    // 🔔 Send notification to each HR
    for (const email of formattedHRs) {
      await sendNotification({
        recipientEmail: email,
        title: "New Vacancy Assigned",
        message: `A new vacancy "${position}" has been assigned to you in ${department}.`,
        type: "vacancy",
      });
    }

    res.status(201).json(newPosition);
  } catch (error) {
    console.error("🚨 Error creating position:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//get all active positions
router.get("/get-position", async (req, res) => {
  try {
    const positions = await ActivePosition.findAll();
    res.status(200).json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update Active position(Also updates HR vacancy)
router.put("/update/:id", async (req, res) => {
  try {
    const position = await ActivePosition.findByPk(req.params.id);
    if (!position)
      return res.status(404).json({ message: "Positions not found" });

    await position.update(req.body);
    res.json({ message: "Position updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Active Position (Also deletes HRVacancy)
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await ActivePosition.destroy({
      where: { job_id: req.params.id },
    });
    if (!deleted)
      return res.status(404).json({ message: "Position not found" });

    res.json({ message: "Position deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
