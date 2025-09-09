const express = require("express");
const router = express.Router();
const HRDataTracker = require("../models/HRDataTracker");
const HR = require("../models/HR");
const Candidate = require("../models/Candidate");
const ActiveList = require("../models/ActiveList");
const { Op } = require("sequelize");

// ✅ Add HR Data Tracker Entry
router.post("/add", async (req, res) => {
  try {
    const newEntry = await HRDataTracker.create(req.body);
    res.status(201).json({
      message: "HR Data Tracker entry added successfully!",
      entry: newEntry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding HR Data Tracker entry",
      error: error.message,
    });
  }
});

// routes/hrDataTrackerRoutes.js
router.get("/filtered-from-activelist", async (req, res) => {
  try {
    const { status, hr_name, startDate, endDate } = req.query;

   const whereClause = {};
if (status) whereClause.progress_status = status;
if (hr_name) whereClause.HR_name = hr_name;
if (startDate && endDate) {
  whereClause.entry_date = {
    [Op.between]: [new Date(startDate), new Date(endDate)],
  };
}

const results = await ActiveList.findAll({
  where: whereClause,
});

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching ActiveList filtered data:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// routes/activeList.js or wherever your update logic exists

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { status, status_date, hr_id } = req.body;

  try {
    const candidate = await ActiveList.findByPk(id);
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    await candidate.update({ status, status_date });

    // ✅ Automatically insert into HRDataTracker
    await HRDataTracker.create({
      hr_id: hr_id || candidate.hr_id,
      candidate_id: candidate.id,
      status: status,
      from_date: status_date, // You can use new Date() if needed
      to_date: status_date,
    });

    res
      .status(200)
      .json({ message: "Candidate updated and HRDataTracker entry created" });
  } catch (error) {
    console.error("❌ Error updating candidate and HRDataTracker:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get HR Data Tracker with HR & ActiveList Info
router.get("/fetch", async (req, res) => {
  try {
    // const trackerData = await HRDataTracker.findAll({
    //   include: [
    //     {
    //       model: HR,
    //       as: "HR",
    //       attributes: ["name"],
    //     },
    //     {
    //       model: ActiveList,
    //       as: "Candidate", // alias used in association
    //       attributes: ["candidate_name", "position", "status_date", "entry_date"],
    //     },
    //   ],
    //   attributes: ["status", "from_date", "to_date"],
    // });
    const trackerData = await HR.findAll();
    console.log(trackerData);
    res.status(200).json(trackerData);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching HR Data Tracker",
      error: error.message,
    });
  }
});



module.exports = router;
