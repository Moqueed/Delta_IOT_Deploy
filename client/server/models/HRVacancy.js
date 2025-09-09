const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HRVacancy = sequelize.define("HRVacancy", {
  job_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
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
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vacancy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  minimum_experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maximum_experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  job_description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  HRs: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error("HRs must be an array");
        }
        if (value.length === 0) {
          throw new Error("HRs cannot be empty");
        }
      },
    },
  },
});

HRVacancy.associate = (models) => {
  HRVacancy.belongsTo(models.ActivePosition, {
    foreignKey: "job_id",
    targetKey: "job_id",
  });
};


module.exports = HRVacancy;
