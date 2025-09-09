// models/HRVacancyAssignment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HRVacancyAssignment = sequelize.define("HRVacancyAssignment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hr_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
});

  HRVacancyAssignment.associate = (models) => {
    HRVacancyAssignment.belongsTo(models.ActivePosition, {
      foreignKey: "job_id",
      targetKey: "job_id",
    });
  };

module.exports = HRVacancyAssignment;
