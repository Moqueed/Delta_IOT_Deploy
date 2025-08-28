const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const HR = require("./HR");
const Candidate = require("./Candidate");

const AssignToHR = sequelize.define(
  "AssignToHR",
  {
    HR_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // allow null because candidate may not exist in Candidate table
      references: {
        model: "Candidates",
        key: "id",
      },
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
      type: DataTypes.STRING, // e.g., store uploaded resume file path
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Associations (still keeping for relational queries if needed)
AssignToHR.associate = (models) => {
    AssignToHR.belongsTo(models.HR, { foreignKey: "HR_id" });
    // AssignToHR.belongsTo(models.Candidate, { foreignKey: "candidate_id" });
  };

module.exports = AssignToHR;
