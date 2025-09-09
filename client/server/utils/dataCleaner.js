const Rejected = require("../models/Rejected");
const {
  TotalMasterData,
  AboutToJoin,
  NewlyJoined,
  BufferData,
  
} = require("../models/TotalData");

const removeCandidateFromAllExcept = async (candidateEmail, exceptModelName) => {
  const models = {
    TotalMasterData,
    AboutToJoin,
    NewlyJoined,
    BufferData,
    Rejected
  };

  for (const [name, model] of Object.entries(models)) {
    if (name !== exceptModelName) {
      await model.destroy({
        where: { candidate_email_id: candidateEmail },
      });
    }
  }
};

module.exports = { removeCandidateFromAllExcept };
