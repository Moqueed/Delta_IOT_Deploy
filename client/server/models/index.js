// Import models
const ActivePosition = require("./ActivePosition");
const HRVacancy = require("./HRVacancy");
const Candidate = require("./Candidate");
const HR = require("./HR");
const AssignToHR = require("./AssignToHR");
const AssignedCandidate = require("./AssignedCandidate");
const sequelize = require("../config/database");
const HRVacancyAssignment = require("./HRVacancyAssignment");
const ActiveList = require("./ActiveList");
const HRDataTracker = require("./HRDataTracker");



const models = {
  sequelize,
  ActivePosition,
  HRVacancy,
  Candidate,
  HR,
  AssignToHR,
  AssignedCandidate,
  HRVacancyAssignment,
  ActiveList,
  HRDataTracker,
};



// ✅ Setup associations (recommended way)
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Optional: Export all models
module.exports = models; 