const express = require("express");
const router = express.Router();
const ActiveList = require("../models/ActiveList");
const Candidate = require("../models/Candidate");
const Rejected = require("../models/Rejected");
const Approval = require("../models/Approval");
const nodemailer = require("nodemailer");
const sendNotification = require("../utils/sendNotification");

// ✅ Mail setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.EMAIL_ADMIN_PASS,
  },
});

const sendMail = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to,
      subject,
      text: message,
    });
    console.log(`📩 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

// ✅ Approval & Rejected by Admin
router.put("/review-status/:email", async (req, res) => {
  try {
    const approval_status = String(
      req.body.approval_status?.value || req.body.approval_status
    ).trim();

    const approvalRequest = await Approval.findOne({
      where: {
        candidate_email_id: req.params.email,
        approval_status: "Pending",
      },
    });

    if (!approvalRequest) {
      return res.status(404).json({ error: "No pending review found" });
    }

    const {
      progress_status,
      comments,
      HR_mail,
      candidate_name,
      candidate_email_id,
    } = approvalRequest;

    // Valid ENUM values from your DB
    const validStatuses = [
      "Application Received",
      "Phone Screening",
      "L1 Interview",
      "Yet to Share",
      "L2 Interview",
      "Shared with Client",
      "Final Discussion",
      "Offer Released",
      "Joined",
      "Declined Offer",
      "Rejected",
      "Withdrawn",
      "No Show",
      "Buffer",
      "Hold",
      "HR Round Cleared",
    ];

    if (approval_status === "Approved") {
      if (!progress_status || !validStatuses.includes(progress_status)) {
        return res
          .status(400)
          .json({ error: "Invalid or missing progress status" });
      }

      // Update ActiveList with the approved progress_status
      await ActiveList.update(
        { progress_status },
        { where: { candidate_email_id } }
      );

        // ✅ Send Approved notification to HR
      await sendNotification({
        title: "Candidate Approved",
        message: `${candidate_name} has been moved to Active list.`,
        recipientEmail: HR_mail,
        type: "activeList",
      });

      // Send approval email to HR
      await sendMail(
        HR_mail,
        `Candidate Approved ✅ - ${candidate_name}`,
        `Good news!\n\nThe candidate ${candidate_name} has been approved.\n\nNew Status: ${progress_status}\n\nComments: ${
          comments || "No additional comments."
        }`
      );
    } else if (approval_status === "Rejected") {
      const existingRejected = await Rejected.findOne({
        where: { candidate_email_id },
      });

      if (existingRejected) {
        // Update the existing record
        await existingRejected.update({
          ...approvalRequest.dataValues,
          progress_status: "Rejected",
          rejection_reason: comments || "No comments provided",
        });
      } else {
        // Create new entry if not found
        await Rejected.create({
          ...approvalRequest.dataValues,
          progress_status: "Rejected",
          rejection_reason: comments || "No comments provided",
        });
      }

      // Remove from ActiveList after rejection
      await ActiveList.destroy({ where: { candidate_email_id } });

      // ✅ Send Reject notification to HR
      await sendNotification({
        title: "Candidate Rejected",
        message: `${candidate_name} has been moved to Rejected list.`,
        recipientEmail: HR_mail,
        type: "rejected",
      });

      // Notify HR
      await sendMail(
        HR_mail,
        `Candidate Rejected ❌ - ${candidate_name}`,
        `Unfortunately, the candidate ${candidate_name} has been rejected.\n\nComments: ${
          comments || "No additional comments."
        }`
      );
    }

    // Update the approval status in Approvals table
    await approvalRequest.update({ approval_status });
    console.log(
      "updating with approval_status:",
      approval_status,
      typeof approval_status
    );

    res.status(200).json({ message: `Candidate ${approval_status}` });
  } catch (error) {
    console.error("❌ Error reviewing candidate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//New Approval
router.post("/newApproval", async (req, res) => {
  try {
    const newApproval = await Approval.create(req.body);
    res.status(201).json(newApproval);
  } catch (error) {
    console.error("Error creating approval:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Edit approval request
router.put("/approval/:id", async (req, res) => {
  try {
    const approval = await Approval.findByPk(req.params.id);
    if (!approval) return res.status(404).json({ error: "Approval not found" });

    await approval.update(req.body);
    res
      .status(200)
      .json({ message: "Approval updated successfully", approval });
  } catch (error) {
    console.error("Error updating approval:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Save a new approval request (initial draft)
router.post("/approval/save", async (req, res) => {
  try {
    const {
      active_list_id,
      HR_name,
      HR_mail,
      entry_date,
      candidate_name,
      position,
      department,
      skills,
      progress_status,
      profile_stage,
      status_date,
      candidate_email_id,
      contact_number,
      current_company,
      current_location,
      permanent_location,
      qualification,
      experience,
      current_ctc,
      expected_ctc,
      band,
      reference,
      notice_period,
      comments,
      attachments,
      requested_by,
    } = req.body;

    const savedApproval = await Approval.create({
      active_list_id,
      HR_name,
      HR_mail,
      entry_date,
      candidate_name,
      position,
      department,
      skills,
      progress_status,
      profile_stage,
      status_date,
      candidate_email_id,
      contact_number,
      current_company,
      current_location,
      permanent_location,
      qualification,
      experience,
      current_ctc,
      expected_ctc,
      band,
      reference,
      notice_period,
      comments,
      attachments,
      status: "Pending", // or "Draft" if you add it in ENUM
      approval_status: "Pending", // still waiting for admin
      requested_by,
    });

    res
      .status(201)
      .json({ message: "Approval saved successfully", savedApproval });
  } catch (error) {
    console.error("Error saving approval:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel approval request (soft cancel)
router.put("/approval/cancel/:id", async (req, res) => {
  try {
    const approval = await Approval.findByPk(req.params.id);
    if (!approval || approval.approval_status !== "Pending") {
      return res
        .status(400)
        .json({ error: "Only pending approvals can be canceled" });
    }

    await approval.update({ approval_status: "Cancelled" });

    res.status(200).json({ message: "Approval cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling approval:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/fetch", async (req, res) => {
  try {
    const approvals = await Approval.findAll();
    res.status(200).json(approvals);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
