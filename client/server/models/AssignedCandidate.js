const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Candidate = require("./Candidate");

//this model belongs to assign to hr
const AssignedCandidate = sequelize.define("AssignedCandidate", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  HR_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  HR_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  HR_mail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  candidate_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  candidate_email_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachments: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Associations (still keeping for relational queries if needed)
AssignedCandidate.associate = (models) => {
  AssignedCandidate.belongsTo(models.HR, {
    foreignKey: "HR_mail",
    targetKey: "email",
    as: "HR",
  });

  // AssignedCandidate.belongsTo(models.Candidate, {
  //   foreignKey: "candidate_email_id",
  //   targetKey: "candidate_email_id",
  //   as: "candidate",
  // });
};

module.exports = AssignedCandidate;
