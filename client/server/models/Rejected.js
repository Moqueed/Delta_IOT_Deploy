const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Rejected = sequelize.define("Rejected", {
  candidate_email_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  candidate_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  progress_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  status_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Rejected;
