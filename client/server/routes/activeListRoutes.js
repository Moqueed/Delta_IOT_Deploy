const express = require("express");
const router = express.Router();
const ActiveList = require("../models/ActiveList");
const Approval = require("../models/Approval");
const Candidate = require("../models/Candidate");
const HR = require("../models/HR");
const Rejected = require("../models/Rejected");
const nodemailer = require("nodemailer");
const {
  TotalMasterData,
  AboutToJoin,
  NewlyJoined,
  BufferData,
} = require("../models/TotalData");
const sequelize = require("../config/database");
const { removeCandidateFromAllExcept } = require("../utils/dataCleaner");
const { Op, where } = require("sequelize");
const sendNotification = require("../utils/sendNotification");

// Mail setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ✅ Change progress status directly
router.put("/change-status/:email", async (req, res) => {
  try {
    const { progress_status } = req.body;
    await Candidate.update(
      { progress_status },
      { where: { candidate_email_id: req.params.email } }
    );
    await ActiveList.update(
      { progress_status },
      { where: { candidate_email_id: req.params.email } }
    );

    res.status(200).json({ message: "Progress status updated successfully" });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//add to activelist
router.post("/add-active-list", async (req, res) => {
  try {
    let {
      candidate_id,
      candidate_name,
      candidate_email_id,
      position,
      department,
      progress_status,
      entry_date,
      HR_name,
      HR_mail,
      comments,
      attachments,
      skills,
      contact_number,
      current_company,
    } = req.body;

    if (!candidate_id) {
      return res.status(400).json({ message: "candidate_id is required" });
    }

    if (typeof skills === "string") {
      skills = skills.split(",").map((s) => s.trim());
    }

    const formattedEntryDate = entry_date
      ? new Date(entry_date).toISOString().slice(0, 19).replace("T", " ")
      : null;

    const newEntry = await ActiveList.create({
      candidate_id,
      candidate_name,
      candidate_email_id,
      position,
      department,
      progress_status,
      entry_date: formattedEntryDate,
      HR_name,
      HR_mail,
      comments,
      attachments,
      skills,
      contact_number,
      current_company,
    });

    res
      .status(201)
      .json({ message: "Candidate added to Active List", data: newEntry });
  } catch (error) {
    console.error("Error inserting into Active List:", error);
    res
      .status(500)
      .json({ message: "Failed to add candidate to Active List", error });
  }
});

//for unique HR
router.get("/by-hr/:email", async (req, res) => {
  const hrEmail = req.params.email;
  try {
    const candidates = await ActiveList.findAll({
      where: { HR_mail: hrEmail },
    });

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching HR-specific Active List:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//update active list
router.put("/update-active-list/:candidate_id", async (req, res) => {
  const { candidate_id } = req.params;
  const {
    HR_name = "",
    HR_mail = "",
    candidate_name = "",
    candidate_email_id = "",
    contact_number = "",
    current_company = "",
    current_location = "",
    permanent_location = "",
    qualification = "",
    reference = "",
    skills = [],
    position = "",
    department = "",
    progress_status = "",
    entry_date = null,
    comments = "",
    attachments = "",
    profile_stage = "open",
  } = req.body;

  try {
    const [existing] = await sequelize.query(
      "SELECT * FROM activelist WHERE candidate_id = ?",
      { replacements: [candidate_id] }
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Candidate not found in Active List" });
    }

    const formattedEntryDate = entry_date
      ? new Date(entry_date).toISOString().slice(0, 19).replace("T", " ")
      : null;

    const formattedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim())
      : [];

    await sequelize.query(
      `UPDATE activelist SET
        HR_name = ?, HR_mail = ?, candidate_name = ?, candidate_email_id = ?, contact_number = ?,
        current_company = ?, current_location = ?, permanent_location = ?, qualification = ?, reference = ?,
        skills = ?, position = ?, department = ?, progress_status = ?, entry_date = ?, comments = ?,
        attachments = ?, profile_stage = ?
      WHERE candidate_id = ?`,
      {
        replacements: [
          HR_name,
          HR_mail,
          candidate_name,
          candidate_email_id,
          contact_number,
          current_company,
          current_location,
          permanent_location,
          qualification,
          reference,
          JSON.stringify(formattedSkills),
          position,
          department,
          progress_status,
          formattedEntryDate,
          comments,
          attachments,
          profile_stage,
          candidate_id,
        ],
      }
    );

    res.status(200).json({ message: "Active List updated successfully" });
  } catch (err) {
    console.error("Error updating Active List:", err);
    res.status(500).json({ message: "Server error updating Active List" });
  }
});

// ✅ HR Request review for Admin
router.put("/request-review/:email", async (req, res) => {
  try {
    const { progress_status, requested_by } = req.body;
    const email = req.params.email;

    console.log(`Requesting review for: ${email}`);

    const candidate = await Candidate.findOne({
      where: { candidate_email_id: email },
    });
    const activeListEntry = await ActiveList.findOne({
      where: { candidate_email_id: email },
    });

    if (!candidate || !activeListEntry)
      return res.status(404).json({ error: "Candidate not found" });

    await Approval.create({
      active_list_id: activeListEntry.id,
      candidate_email_id: candidate.candidate_email_id,
      candidate_name: candidate.candidate_name,
      HR_name: activeListEntry.HR_name,
      HR_mail: activeListEntry.HR_mail,
      contact_number: candidate.contact_number,
      position: candidate.position,
      department: candidate.department,
      progress_status: activeListEntry.progress_status,
      requested_by,
      approval_status: "Pending",
      entry_date: new Date(),
      status_date: new Date(),
    });

    // await ActiveList.destroy({
    //   where: {candidate_email_id: candidate.candidate_email_id},
    // });

    await sendNotification({
      recipientEmail: process.env.EMAIL_ADMIN,
      type: "approval",
      title: "Review Request Submitted",
      message: `${candidate.candidate_name} has been requested for review`,
      type: "approval",
    });

    //✅ Notify Admin via mail
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_ADMIN,
      subject: `Review Request for ${candidate.candidate_name}`,
      text: `Dear Admin,

      A review request has been by ${activeListEntry.HR_name} for the candidate:

      Name: ${candidate.candidate_name}
      Email: ${candidate.candidate_email_id}
      Position: ${candidate.position}
      Department: ${candidate.department}
      current Status: ${candidate.progress_status}
      Requested Status: ${progress_status}

        Please review and take necessary action on the dashboard.

        Regards,
        Recruitment Team`,
    };

    await transporter.sendMail(adminMailOptions);

    res.status(200).json({ message: "Review request sent to admin" });
  } catch (error) {
    console.error("❌ Error requesting review:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//HR mail to manager
router.post("/notify-manager", async (req, res) => {
  try {
    const { candidate_id, progress_status } = req.body;
    console.log("📩 Notifying manager for candidate:", candidate_id);

    if (progress_status.toLowerCase() !== "yet to share") {
      return res.status(400).json({ message: "Invalid progress status" });
    }

    const candidate = await Candidate.findByPk(candidate_id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const managerEmail = process.env.EMAIL_MANAGER;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: managerEmail,
      subject: `Candidate "${candidate.candidate_name}" details`,
      text: `Hello Manager,
      
      A new candidate has been assigned, Kindly Review:
      
      Name: ${candidate.candidate_name}
      Email: ${candidate.candidate_email_id}
      Contact: ${candidate.contact_number || "N/A"}
      Position: ${candidate.position || "N/A"}

      
      Please Review the details.`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Notification sent to manager" });
  } catch (error) {
    console.error("❌ Error notifying manager:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Allowed progress statuses for triggering data move
const totalMaster = [
  "application received",
  "phone screening",
  "l1 interview",
  "Yet to Share",
  "l2 interview",
  "shared with client",
];

// PUT /activelist/total-master-data/:id
router.put("/total-master-data/:id", async (req, res) => {
  const { id } = req.params;
  const { progress_status } = req.body;

  if (!progress_status || typeof progress_status !== "string") {
    return res
      .status(400)
      .json({ message: "Invalid progress status provided" });
  }

  try {
    const activeRecord = await ActiveList.findByPk(id);

    if (!activeRecord) {
      return res.status(404).json({ message: "ActiveList record not found" });
    }

    // Update progress_status
    await ActiveList.update({ progress_status }, { where: { id } });

    const today = new Date();

    // Check if entry already exists in TotalMasterData
    const existingEntry = await TotalMasterData.findOne({
      where: {
        candidate_email_id: activeRecord.candidate_email_id,
      },
    });

    if (existingEntry) {
      await TotalMasterData.update(
        { progress_status },
        {
          where: {
            candidate_email_id: activeRecord.candidate_email_id,
          },
        }
      );

      return res.status(200).json({
        message: "Progress status updated in both ActiveList",
      });
    }

    await removeCandidateFromAllExcept(
      activeRecord.candidate_email_id,
      "TotalMasterData"
    );
    // If new status is in the allowed list, move to TotalMasterData
    if (totalMaster.includes(progress_status.toLowerCase())) {
      await TotalMasterData.create({
        HR_name: activeRecord.HR_name,
        HR_mail: activeRecord.HR_mail,
        candidate_id: activeRecord.candidate_id,
        candidate_name: activeRecord.candidate_name,
        candidate_email_id: activeRecord.candidate_email_id,
        position: activeRecord.position,
        department: activeRecord.department,
        progress_status: progress_status,
        status_date: today,
        entry_date: activeRecord.entry_date || today,
      });

      // 🔔 Send notification for new insert for TotalMaster
      await sendNotification({
        title: "Candidate Moved",
        recipientEmail: activeRecord.HR_mail,
        message: `Candidate ${activeRecord.candidate_name} moved to Total Master Data`,
        type: "totalMaster",
      });

      return res.status(200).json({
        message: "Progress status updated and data moved to Total Master Data",
      });
    } else {
      return res.status(200).json({
        message: "Progress status not eligible for Total Master Data",
      });
    }
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const aboutToJoin = ["offer released", "final discussion", "HR Round cleared"];

//About to join
router.put("/about-to-join/:id", async (req, res) => {
  const { id } = req.params;
  const { progress_status } = req.body;

  try {
    const activeRecord = await ActiveList.findByPk(id);

    if (!activeRecord) {
      return res.status(404).json({ message: "ActiveList record not found" });
    }

    // Update progress_status
    await ActiveList.update({ progress_status }, { where: { id } });

    const today = new Date();

    // Check if entry already exists in about_to_join
    const existingEntry = await AboutToJoin.findOne({
      where: {
        candidate_email_id: activeRecord.candidate_email_id,
      },
    });

    if (existingEntry) {
      await AboutToJoin.update(
        { progress_status },
        {
          where: {
            candidate_email_id: activeRecord.candidate_email_id,
          },
        }
      );

      return res.status(200).json({
        message: "Progress status updated in both ActiveList and About To Join",
      });
    }

    await removeCandidateFromAllExcept(
      activeRecord.candidate_email_id,
      "AboutToJoin"
    );
    // If new status is in the allowed list, move to About ToJoin
    if (aboutToJoin.includes(progress_status.toLowerCase())) {
      await AboutToJoin.create({
        candidate_id: activeRecord.candidate_id,
        candidate_name: activeRecord.candidate_name,
        candidate_email_id: activeRecord.candidate_email_id,
        position: activeRecord.position,
        department: activeRecord.department,
        progress_status: progress_status,
        joining_date: today,
        HR_name: activeRecord.HR_name,
        HR_mail: activeRecord.HR_mail,
      });

      // 🔔 Send notification for new insert for AboutToJoin
      await sendNotification({
        title: "Candidate Moved",
        recipientEmail: activeRecord.HR_mail,
        message: `Candidate ${activeRecord.candidate_name} moved to About to Join `,
        type: "aboutToJoin",
      });

      return res.status(200).json({
        message: "Progress status updated and data moved to About to Join",
      });
    } else {
      return res.status(200).json({
        message: "Progress status not eligible for About to Join",
      });
    }
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Newly Joined
const newlyJoined = ["joined"]; // Make sure it's lowercase

router.put("/newly-joined/:id", async (req, res) => {
  const { id } = req.params;
  const { progress_status } = req.body;

  try {
    const activeRecord = await ActiveList.findByPk(id);

    if (!activeRecord) {
      return res.status(404).json({ message: "ActiveList record not found" });
    }

    const today = new Date();

    // Only allow status in newlyJoined list
    if (newlyJoined.includes(progress_status.toLowerCase())) {
      // Update ActiveList
      await ActiveList.update({ progress_status }, { where: { id } });

      // Check if already exists in NewlyJoined
      const existingEntry = await NewlyJoined.findOne({
        where: {
          candidate_email_id: activeRecord.candidate_email_id,
        },
      });

      if (existingEntry) {
        await NewlyJoined.update(
          { progress_status },
          {
            where: {
              candidate_email_id: activeRecord.candidate_email_id,
            },
          }
        );

        return res.status(200).json({
          message: "Progress status updated in both ActiveList and NewlyJoined",
        });
      }
      await removeCandidateFromAllExcept(
        activeRecord.candidate_email_id,
        "NewlyJoined"
      );
      // If not already in NewlyJoined, insert new
      await NewlyJoined.create({
        candidate_id: activeRecord.candidate_id,
        candidate_name: activeRecord.candidate_name,
        candidate_email_id: activeRecord.candidate_email_id,
        position: activeRecord.position,
        department: activeRecord.department,
        progress_status: progress_status, // use new status from request
        joining_date: today,
        HR_name: activeRecord.HR_name,
        HR_mail: activeRecord.HR_mail,
      });

      // 🔔 Send notification for new insert for NewlyJoined
      await sendNotification({
        title: "Candidate Moved",
        recipientEmail: activeRecord.HR_mail,
        message: `Candidate ${activeRecord.candidate_name} moved to Newly Joined `,
        type: "newlyJoined",
      });

      return res.status(200).json({
        message: "Progress status updated and data moved to NewlyJoined",
      });
    }

    return res.status(200).json({
      message: "Progress status not eligible for NewlyJoined",
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Buffer Data
const bufferStatuses = ["hold", "buffer"]; // use lowercase

router.put("/buffer-data/:id", async (req, res) => {
  const { id } = req.params;
  const { progress_status, status_reason } = req.body;

  try {
    const activeRecord = await ActiveList.findByPk(id);

    if (!activeRecord) {
      return res.status(404).json({ message: "ActiveList record not found" });
    }

    const today = new Date();

    // Only allow buffer-status candidates
    if (bufferStatuses.includes(progress_status.toLowerCase())) {
      // Update ActiveList
      await ActiveList.update({ progress_status }, { where: { id } });

      // Check if already in BufferData
      const existingEntry = await BufferData.findOne({
        where: {
          candidate_email_id: activeRecord.candidate_email_id,
        },
      });

      if (existingEntry) {
        await BufferData.update(
          { progress_status },
          {
            where: {
              candidate_email_id: activeRecord.candidate_email_id,
            },
          }
        );

        return res.status(200).json({
          message: "Progress status updated in both ActiveList and BufferData",
        });
      }

      await removeCandidateFromAllExcept(
        activeRecord.candidate_email_id,
        "BufferData"
      );
      // If not in BufferData, create new entry
      await BufferData.create({
        candidate_id: activeRecord.candidate_id,
        candidate_name: activeRecord.candidate_name,
        candidate_email_id: activeRecord.candidate_email_id,
        position: activeRecord.position,
        department: activeRecord.department,
        progress_status: progress_status,
        HR_name: activeRecord.HR_name,
        HR_mail: activeRecord.HR_mail,
        status_reason: status_reason,
      });

       // 🔔 Send notification for new insert for BufferData
      await sendNotification({
        title: "Candidate Moved",
        recipientEmail: activeRecord.HR_mail,
        message: `Candidate ${activeRecord.candidate_name} moved to Buffer Data `,
        type: "bufferData",
      });

      return res.status(200).json({
        message: "Progress status updated and data moved to BufferData",
      });
    }

    return res.status(200).json({
      message: "Progress status not eligible for BufferData",
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Progress statuses that mean rejection
const rejectedStatuses = ["rejected", "declined offer", "no show", "withdrawn"];

// 🔹 Move from ActiveList → Rejected
router.put("/rejected-data/:id", async (req, res) => {
  const { id } = req.params;
  const { progress_status, rejection_reason } = req.body;

  try {
    // Find ActiveList record
    const activeRecord = await ActiveList.findOne({ where: { candidate_id: id } }); 
    if (!activeRecord) {
      return res.status(404).json({ message: "ActiveList record not found" });
    }

    const normalizedStatus = progress_status?.toLowerCase();

    if (rejectedStatuses.includes(normalizedStatus)) {
      // Update ActiveList
      await ActiveList.update(
        { progress_status: normalizedStatus },
        { where: { candidate_id: id } }
      );

      // Check if already in Rejected
      const existingEntry = await Rejected.findOne({
        where: { candidate_email_id: activeRecord.candidate_email_id },
      });

      if (existingEntry) {
        await Rejected.update(
          {
            progress_status: normalizedStatus,
            rejection_reason: rejection_reason || "Moved from Active List",
            status_date: new Date(),
          },
          { where: { candidate_email_id: activeRecord.candidate_email_id } }
        );

        return res.status(200).json({
          message: "Updated in both ActiveList and Rejected Data",
        });
      }

      // Remove from other tables before inserting
      await removeCandidateFromAllExcept(activeRecord.candidate_email_id, "Rejected");

      // Insert new rejected entry
      await Rejected.create({
        candidate_id: activeRecord.candidate_id,
        candidate_name: activeRecord.candidate_name,
        candidate_email_id: activeRecord.candidate_email_id,
        position: activeRecord.position,
        department: activeRecord.department,
        progress_status: normalizedStatus,
        rejection_reason: rejection_reason || "Moved from Active List",
        status_date: new Date(),
        HR_name: activeRecord.HR_name,
        HR_mail: activeRecord.HR_mail,
      });

      // Notification (non-blocking)
      try {
        await sendNotification({
          title: "Candidate Rejected",
          recipientEmail: activeRecord.HR_mail,
          message: `Candidate ${activeRecord.candidate_name} moved to Rejected. Reason: ${rejection_reason || "Not specified"}`,
          type: "rejected",
        });
      } catch (notifyErr) {
        console.error("⚠️ Notification failed:", notifyErr.message);
      }

      return res.status(200).json({
        message: "Progress status updated and moved to Rejected Data",
      });
    }

    return res.status(200).json({
      message: "Progress status not eligible for Rejected Data",
    });
  } catch (error) {
    console.error("❌ Error updating RejectedData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//filter in HR tracker page
router.get("/filter", async (req, res) => {
  try {
    const { status, hr_name, startDate, endDate } = req.query;

    const whereClause = {};
    if (status) whereClause.progress_status = status;
    if (hr_name) whereClause.HR_name = hr_name;
    if (startDate && endDate) {
      whereClause.status_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const include = [];
    if (hr_name) {
      include.push({
        model: HR,
        as: "HR",
        where: { name: hr_name },
        attributes: ["id", "name", "email"],
      });
    }

    const filteredCandidates = await ActiveList.findAll({
      where: whereClause,
      order: [["status_date", "DESC"]],
    });

    res.json(filteredCandidates);
  } catch (error) {
    console.error("❌ Error in filtering ActiveList:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

//Delete from activeList
router.delete("/delete/:id", async (req, res) => {
  const candidateId = req.params.id;

  try {
    const deleted = await ActiveList.destroy({
      where: { candidate_id: candidateId },
    });

    if (deleted) {
      res.status(200).json({ message: "candidate deleted successfully" });
    } else {
      res.status(404).json({ message: "candidate not found" });
    }
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
