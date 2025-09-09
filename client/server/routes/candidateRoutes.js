// routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const ActiveList = require("../models/ActiveList");
const Rejected = require("../models/Rejected");
const { NewlyJoined } = require("../models/TotalData");
const AssignedCandidate = require("../models/AssignedCandidate");
const { Op } = require("sequelize");
const sendNotification = require("../utils/sendNotification");

// ✅ Add new candidate and conditionally sync to ActiveList
router.post("/add-candidate", async (req, res) => {
  try {
    let {
      HR_name,
      HR_mail,
      candidate_name,
      candidate_email_id,
      contact_number,
      current_company,
      current_location,
      permanent_location,
      qualification,
      experience,
      skills,
      current_ctc,
      expected_ctc,
      band,
      reference,
      position,
      department,
      progress_status,
      status_date,
      entry_date,
      attachments,
      profile_stage,
      notice_period,
      comments,
    } = req.body;

    if (typeof skills === "string") {
      skills = skills.split(",").map((skill) => skill.trim());
    }

    if (
      !candidate_email_id ||
      !candidate_name ||
      !contact_number ||
      !HR_name ||
      !HR_mail ||
      !progress_status
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const candidate = await Candidate.create({
      HR_name,
      HR_mail,
      candidate_name,
      candidate_email_id,
      contact_number,
      current_company,
      current_location,
      permanent_location,
      qualification,
      experience,
      skills,
      current_ctc,
      expected_ctc,
      band,
      reference,
      position,
      department,
      progress_status,
      status_date,
      entry_date,
      attachments,
      profile_stage,
      notice_period,
      comments,
    });

    if (!candidate || !candidate.id) {
      return res.status(500).json({ error: "Candidate creation failed" });
    }

    const exists = await ActiveList.findOne({
      where: { candidate_email_id: candidate_email_id },
    });

    if (!exists) {
      await ActiveList.create({
        candidate_id: candidate.id,
        candidate_name,
        candidate_email_id,
        contact_number,
        HR_name,
        HR_mail,
        current_company,
        current_location,
        permanent_location,
        qualification,
        reference,
        skills,
        position,
        department,
        progress_status,
        comments,
        attachments,
        profile_stage,
        status_date,
        entry_date,
      });

      await sendNotification({
        recipientEmail: HR_mail,
        title: "New Candidate Added",
        message: `Candidate "${candidate_name}" has been added to the Active List for position "${position}" in department}.`,
        type: "candidate",
      })
    }

    res.status(201).json({
      message: "Candidate added successfully",
      candidate,
    });
  } catch (error) {
    console.error("❌ Error adding candidate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Search candidate by email for duplicate prevention
router.get("/search/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const foundInActive = await ActiveList.findOne({
      where: { candidate_email_id: email },
    });
    const foundInRejected = await Rejected.findOne({
      where: { candidate_email_id: email },
    });
    const foundInNewlyJoined = await NewlyJoined.findOne({
      where: { candidate_email_id: email },
    });

    if (foundInRejected)
      return res.status(200).json({ message: "Candidate is in Rejected list" });
    if (foundInNewlyJoined)
      return res.status(200).json({ message: "Candidate is already joined" });
    if (foundInActive)
      return res
        .status(200)
        .json({ message: "Candidate is already in Active List" });

    res.status(200).json({ message: "Candidate not found, you can proceed" });
  } catch (error) {
    console.error("❌ Error searching candidate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all candidates
// 📁 routes/candidates.js
router.get("/by-hr/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const assignedCandidates = await Candidate.findAll({
      where: { HR_mail: email },
      attributes: ["candidate_email_id"],
    });

    const candidateEmails = assignedCandidates.map((ac) => ac.candidate_email_id);

    const candidates = await Candidate.findAll({
      where: {
        candidate_email_id: {
          [Op.in]: candidateEmails
        }
      },
    });

    res.status(200).json(candidates);
  } catch (error) {
    console.error("❌ Error fetching HR-specific candidates:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE Candidate by ID (and remove from ActiveList too)
router.delete("/delete-candidate/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find candidate
    const candidate = await Candidate.findByPk(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Delete candidate
    await candidate.destroy();

    // Also remove from ActiveList if exists
  //  await ActiveList.destroy({ where: { candidate_id: id } });

    return res.status(200).json({
      message: "Candidate deleted successfully (and removed from ActiveList)",
    });
  } catch (error) {
    console.error("❌ Error deleting candidate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
