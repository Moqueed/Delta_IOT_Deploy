const express = require("express");
const router = express.Router();
const HRVacancy = require("../models/HRVacancy");
const HRVacancyAssignment = require("../models/HRVacancyAssignment");

router.get("/by-email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const assignments = await HRVacancyAssignment.findAll({
      where: { hr_email: email },
      attributes: ["job_id"],
    });

    const jobIds = assignments.map((a) => a.job_id);

    const vacancies = await HRVacancy.findAll({
      where: { job_id: jobIds },
    });

    res.json(vacancies);
  } catch (error) {
    console.error("❌ Failed to fetch HR vacancies:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


// 📌 GET a specific HRVacancy by job_id
router.get("/get-vacancy/:job_id", async (req, res) => {
  try {
    const vacancy = await HRVacancy.findOne({ where: { job_id: req.params.job_id } });
    if (!vacancy) return res.status(404).json({ message: "Vacancy not found" });
    res.status(200).json(vacancy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 DELETE an HRVacancy
router.delete("/delete-vacancy/:job_id", async (req, res) => {
  try {
    const deleted = await HRVacancy.destroy({ where: { job_id: req.params.job_id } });
    if (!deleted) return res.status(404).json({ message: "Vacancy not found" });
    res.status(200).json({ message: "Vacancy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
