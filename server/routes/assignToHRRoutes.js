const express = require("express");
const router = express.Router();
const {
  getAllNewCandidates,
  searchCandidate,
} = require("../controllers/assignToHRController");


// ✅ Assign Candidate to HR
// router.post("/assigning", async (req, res) => {
//   try {
//     const { hr_id, candidate_id, comments } = req.body;

//     // Check if HR exists
//     const hr = await HR.findByPk(hr_id);
//     if (!hr) return res.status(404).json({ message: "HR not found" });

//     // Check if Candidate exists
//     const candidate = await Candidate.findByPk(candidate_id);
//     if (!candidate) return res.status(404).json({ message: "Candidate not found" });

//     // ✅ Auto-sync resume from Candidate model
//     const resumePath = candidate.attachments;

//     // Create new assignment
//     const newAssignment = await AssignToHR.create({
//       hr_id,
//       candidate_id,
//       attachments: resumePath,
//       comments,
//     });

//     res.status(201).json({
//       message: "Candidate assigned to HR successfully!",
//       assignment: newAssignment,
//     });

//   } catch (error) {
//     console.error("Error assigning candidate to HR:", error);
//     res.status(500).json({ message: "Error assigning candidate to HR", error: error.message });
//   }
// });

// ✅ Search Assigned HR by Email or Contact
router.get("/search", searchCandidate);
router.get("/fetch", getAllNewCandidates);

module.exports = router;
