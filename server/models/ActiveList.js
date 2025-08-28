const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Candidate = require("./Candidate");
const HR = require("./HR");
const HRDataTracker = require("./HRDataTracker");

const ActiveList = sequelize.define(
  "ActiveList",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Candidate,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      unique: true, // Ensure a candidate appears only once in ActiveList
    },
    hr_id: {
      type: DataTypes.INTEGER,
      references: {
        model: HR,
        key: "id",
      },
    },

    candidate_name: { type: DataTypes.STRING, allowNull: false },
    candidate_email_id: { type: DataTypes.STRING, allowNull: false },
    contact_number: { type: DataTypes.STRING(20), allowNull: true },

    HR_name: { type: DataTypes.STRING, allowNull: false },
    HR_mail: { type: DataTypes.STRING, allowNull: false },

    current_company: { type: DataTypes.STRING(100), allowNull: true },
    current_location: { type: DataTypes.STRING(100), allowNull: true },
    permanent_location: { type: DataTypes.STRING(100), allowNull: true },

    qualification: { type: DataTypes.STRING(100), allowNull: true },
    reference: { type: DataTypes.STRING(100), allowNull: true },

    skills: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Skills must be an array");
          }
          if (value.length === 0) {
            throw new Error("Skills cannot be empty");
          }
        },
      },
    },

    position: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },

    progress_status: {
      type: DataTypes.ENUM(
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
        "HR Round Cleared"
      ),
      allowNull: false,
      defaultValue: "Application Received",
    },

    comments: { type: DataTypes.TEXT },
    attachments: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    profile_stage: {
      type: DataTypes.ENUM("open", "closed"),
      allowNull: true,
      defaultValue: "open",
    },
    status_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    entry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "activeList", // Make sure this matches your actual table name exactly
    timestamps: false,
  }
);

ActiveList.belongsTo(Candidate, {
  foreignKey: "candidate_id",
  onDelete: "CASCADE",
});

ActiveList.associate = (models) => {
  ActiveList.belongsTo(models.HR, { foreignKey: "hr_id", as: "HR" });
  ActiveList.hasMany(models.HRDataTracker, { foreignKey: "candidate_id" });
};

module.exports = ActiveList;
