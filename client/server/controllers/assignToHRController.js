const Candidate = require("../models/Candidate");
const AssignToHR = require("../models/AssignToHR");
const HR = require("../models/HR");
const { sendAssignmentMail } = require("../utils/emailHelper");
const AssignedCandidate = require("../models/AssignedCandidate");


const createNewCandidate = async (req, res) => {
  try {
    const {
      HR_id,
      HR_name,
      HR_mail,
      candidate_name,
      candidate_email_id,
      position,
      contact_number,
      comments,
    } = req.body;


    const attachments = req.file ? `/uploads/${req.file.filename}` : null;

    const hrRecord = await HR.findOne({ where: { email: HR_mail } });

    const newCandidate = await AssignedCandidate.create({
      HR_id: hrRecord ? hrRecord.id : null,
      HR_name,
      HR_mail,
      candidate_name,
      candidate_email_id,
      position,
      contact_number,
      comments,
      attachments,
    });
     console.log(newCandidate);
       
    await sendAssignmentMail({
      HREmail: HR_mail,
      HRName: HR_name,
      candidateName: candidate_name,
      candidateEmail: candidate_email_id,
      position,
      contactNumber: contact_number,
      comments,
      resumePath: attachments,
    });
      console.log("Uploaded file:", req.file);

     res
      .status(201)
      .json({ message: "Candidate assigned and email sent to HR", newCandidate });
  } catch (error) {
    console.error("Error assigning candidate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Get the candidates
const getAllNewCandidates = async (req, res) => {
  try {
    const candidates = await AssignedCandidate.findAll();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch new candidates" });
  }
};


//search a candidate to avoid duplicates
const searchCandidate = async (req, res) => {
  try {
    const { HR_email, HR_contact, candidate_name, candidate_email, candidate_contact } =
      req.query;
      console.log(candidate_email);
      

    const whereConditionHR = {};
    const whereConditionCandidate = {};

    // ✅ Filter HR by email or contact
    if (HR_email) whereConditionHR.email = HR_email;
    if (HR_contact) whereConditionHR.contact_number = HR_contact;

    // ✅ Filter Candidate by name or contact
    if (candidate_name) whereConditionCandidate.candidate_name = candidate_name;
    if (candidate_email)
      whereConditionCandidate.candidate_email_id = candidate_email;
    if (candidate_contact)
      candidateWhere.contact_number = candidate_contact;

    const assignments = await AssignedCandidate.findAll({
      include: [
        {
          model: HR,
          as: "HR",
          attributes: ["id", "name", "email", "contact_number"],
          where: Object.keys(whereConditionHR).length
            ? whereConditionHR
            : undefined,
        },
      ],
        where: Object.keys(whereConditionCandidate).length ? whereConditionCandidate : undefined,
      attributes: [
        "id",
        "candidate_name",
        "candidate_email_id",
        "position",
        "contact_number",
        "comments",
        "attachments",
      ],
    });

    res
      .status(200)
      .json({ message: "Filtered Assignments", data: assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res
      .status(500)
      .json({ message: "Error fetching assignments", error: error.message });
  }
};

module.exports = {
  createNewCandidate,
  getAllNewCandidates,
  searchCandidate,
};
