const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const AssignToHR = require("./AssignToHR");

const HR = sequelize.define(
  "HR",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: "hrs", timestamps: false }
);

// ✅ Combine all associations into a single associate method
HR.associate = (models) => {
  HR.hasMany(models.AssignedCandidate, {
    foreignKey: "HR_mail",
    sourceKey: "email",
    as: "assignedCandidates",
  });

  HR.hasMany(models.ActiveList, {
    foreignKey: "hr_id",
    as: "ActiveLists",
  });

  HR.hasMany(models.HRDataTracker, {
    foreignKey: "hr_id",
    as: "HRDataEntries",
  });
};

module.exports = HR;
