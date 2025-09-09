const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HR = require("./HR");
const Candidate = require("./Candidate");
const HRDataTracker = sequelize.define(
  "HRDataTracker",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hr_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: HR,
        key: "id",
      },
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Candidate,
        key: "id",
      },
    },
    status: {
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
        "Hold"
      ),
      allowNull: false,
    },
    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  { timestamps: false }
);

// ✅ Define Associations
HRDataTracker.associate = (models) => {
  HRDataTracker.belongsTo(models.HR, {
    foreignKey: "hr_id",
    as: "HR",
  });
  HRDataTracker.belongsTo(models.ActiveList, {
    foreignKey: "candidate_id",
    as: "Candidate",
  });
};


module.exports = HRDataTracker;
