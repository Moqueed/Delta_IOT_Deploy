const { Op } = require("sequelize");
const express = require("express");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/uploadMiddleware");
const Candidate = require("../models/Candidate");
const ActiveList = require("../models/ActiveList");
const Approval = require("../models/Approval");
const AssignedCandidate = require("../models/AssignedCandidate");
const Upload = require("../models/Upload");
const sendNotification = require("../utils/sendNotification");

const router = express.Router();

// ✅ Resume Upload Route with Upsert for ActiveList & Approvals
router.post("/upload/:email", upload.single("resume"), async (req, res) => {
  try {
    const { email } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file ? `${req.file.filename}` : null;

    // Update Candidate record
    let candidate = await Candidate.findOne({
      where: { candidate_email_id: email },
    });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    await Upload.create({
      filename: file.filename,
      uploaded_by: candidate.HR_mail, // or req.user.email if you're using auth
    });

    candidate.attachments = filePath;
    await candidate.save();
    console.log("Candidate result:", candidate);

    // Upsert for ActiveList: update if exists, else create a new record with full candidate data
    let activeEntry = await ActiveList.findOne({
      where: { candidate_email_id: email },
    });
    if (activeEntry) {
      activeEntry.attachments = filePath;
      await activeEntry.save();
    } else {
      activeEntry = await ActiveList.create({
        candidate_id: candidate.id,
        candidate_email_id: candidate.candidate_email_id,
        HR_name: candidate.HR_name,
        HR_mail: candidate.HR_mail,
        entry_date: candidate.entry_date,
        candidate_name: candidate.candidate_name,
        position: candidate.position,
        department: candidate.department,
        skills: candidate.skills,
        progress_status: candidate.progress_status,
        profile_stage: candidate.profile_stage,
        status_date: candidate.status_date,
        contact_number: candidate.contact_number,
        current_company: candidate.current_company,
        current_location: candidate.current_location,
        permanent_location: candidate.permanent_location,
        qualification: candidate.qualification,
        experience: candidate.experience,
        current_ctc: candidate.current_ctc,
        expected_ctc: candidate.expected_ctc,
        band: candidate.band,
        reference: candidate.reference,
        notice_period: candidate.notice_period,
        attachments: filePath,
        comments: candidate.comments,
      });
      console.log(`Created new ActiveList entry for ${email}`);
    }

    // Upsert for Approvals: update if exists, else create a new record using the ActiveList id
    let approvalEntry = await Approval.findOne({
      where: { candidate_email_id: email },
    });
    if (approvalEntry) {
      approvalEntry.attachments = filePath;
      await approvalEntry.save();
    } else {
      approvalEntry = await Approval.create({
        candidate_email_id: candidate.candidate_email_id,
        active_list_id: activeEntry.id, // Use the ActiveList record's id here
        HR_name: candidate.HR_name,
        HR_mail: candidate.HR_mail,
        entry_date: candidate.entry_date,
        candidate_name: candidate.candidate_name,
        position: candidate.position,
        department: candidate.department,
        skills: candidate.skills,
        progress_status: candidate.progress_status,
        profile_stage: candidate.profile_stage,
        status_date: candidate.status_date,
        contact_number: candidate.contact_number,
        current_company: candidate.current_company,
        current_location: candidate.current_location,
        permanent_location: candidate.permanent_location,
        qualification: candidate.qualification,
        experience: candidate.experience,
        current_ctc: candidate.current_ctc,
        expected_ctc: candidate.expected_ctc,
        band: candidate.band,
        reference: candidate.reference,
        notice_period: candidate.notice_period,
        comments: candidate.comments,
        attachments: filePath,
        status: "Pending", // Default status (adjust if needed)
        requested_by: "System", // Default value (adjust if needed)
      });
      console.log(`Created new Approvals entry for ${email}`);
    }

     // ✅ Send ONE combined notification
    if (candidate) {
      await sendNotification({
        title: "Resume Uploaded & Synced",
        message: `Resume uploaded for ${candidate.candidate_name}. Synced to ActiveList and Approvals.`,
        recipientEmail: candidate.HR_mail,
        type: "upload", // you can change this to "approval" or create a new type if needed
      });
    }

    res.json({
      message: "Resume uploaded and synced successfully",
      candidateResume: candidate.attachments,
      activeListResume: activeEntry.attachments,
      approvalsResume: approvalEntry.attachments,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST: Upload resume to AssignedToHR based on candidate email
router.post(
  "/upload-assigned/:email",
  upload.single("resume"),
  async (req, res) => {
    try {
      const { email } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = path.join("/uploads", file.filename);

      // Find matching record in AssignedToHR
      const assignedEntry = await AssignedCandidate.findOne({
        where: { candidate_email_id: email },
      });

      if (!assignedEntry) {
        return res
          .status(404)
          .json({ message: "AssignedToHR record not found for this email" });
      }

      // Update the attachments field
      assignedEntry.attachments = filePath;
      await assignedEntry.save();

        // ✅ Create & send notification
      await sendNotification({
        title: "Resume Uploaded",
        message: `Resume uploaded for ${assignedEntry.candidate_name} and saved in AssignedToHR.`,
        recipientEmail: assignedEntry.hr_email, // assuming you store HR email in AssignedCandidate
        type: "candidate", // or create "assigned" if you want separate type
      });

      res.status(200).json({
        message: "Resume uploaded successfully to AssignedToHR",
        resumePath: filePath,
      });
    } catch (error) {
      console.error("❌ Error uploading to AssignedToHR:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

//fetch the upload file
router.get("/resume/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", filename);

  res.type("application/pdf");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(404).json({ message: "File not found" });
    }
  });
});

// routes/uploadRoutes.js
router.get("/list", async (req, res) => {
  try {
    const hrEmail = req.query.hr_email;

    if (!hrEmail || typeof hrEmail !== "string") {
      return res.status(400).json({ message: "Valid HR email is required" });
    }

    const files = await Upload.findAll({
      where: { uploaded_by: hrEmail.trim().toLowerCase() },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ files });
  } catch (error) {
    console.error("❌ Error fetching uploads:", error.message);
    res.status(500).json({ message: "Server error while fetching uploads" });
  }
});

// ✅ Serve uploaded file by filename
router.get("/file/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename);
    console.log("📥 Requested file:", req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("❌ Error sending file:", err);
    res.status(500).json({ message: "Server error while sending file" });
  }
});



module.exports = router;
