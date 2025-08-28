const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const HRVacancy = require("./HRVacancy");
const HRVacancyAssignment = require("./HRVacancyAssignment");
const { sendPositionMail } = require("../utils/emailHelper");

const ActivePosition = sequelize.define("ActivePosition", {
  job_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
    validate: {
      isInt: { msg: "Vacancy must be a valid number" },
      min: { args: [1], msg: "Vacancy must be at least 1" },
    },
  },
  manager: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  minimum_experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: "Minimum experience cannot be negative" },
    },
  },
  maximum_experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isGreaterThanMin(value) {
        if (value < this.minimum_experience) {
          throw new Error(
            "Maximum experience must be greater than minimum experience"
          );
        }
      },
    },
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

// Auto-sync to HRVacancy
ActivePosition.afterCreate(async (position) => {
  try {
    console.log("📦 Syncing to HRVacancy... job_id:", position.job_id);
    await HRVacancy.create({
      job_id: position.job_id,
      position: position.position,
      skills: position.skills,
      department: position.department,
      vacancy: position.vacancy,
      minimum_experience: position.minimum_experience,
      maximum_experience: position.maximum_experience,
      job_description: position.job_description,
      HRs: position.HRs,
    });

     // 2. Extract HR emails (support comma-separated string)
    const hrEmails = Array.isArray(position.HRs)
      ? position.HRs
      : position.HRs.split(",").map((email) => email.trim());

    // Use bulkCreate for performance
    const assignments = position.HRs.map((email) => ({
      job_id: position.job_id,
      hr_email: email,
    }));
    await HRVacancyAssignment.bulkCreate(assignments);

     // Send email to each HR
    for (const email of hrEmails) {
      await sendPositionMail(position.position, position.job_description, email);
    }

    console.log("✅ Synced to HRVacancy and HRVacancyAssignment");
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
  }
});

// ✅ Optional: Hook for update (reassign HRs)
ActivePosition.afterUpdate(async (position) => {
  try {
    await HRVacancyAssignment.destroy({ where: { job_id: position.job_id } });

    const assignments = position.HRs.map((email) => ({
      job_id: position.job_id,
      hr_email: email,
    }));
    await HRVacancyAssignment.bulkCreate(assignments);

    console.log("🔄 HR assignments updated");
  } catch (error) {
    console.error("❌ Failed to update HR assignments:", error.message);
  }
});

// ✅ Associations
ActivePosition.associate = (models) => {
  ActivePosition.hasOne(models.HRVacancy, {
    foreignKey: "job_id",
    sourceKey: "job_id",
    onDelete: "CASCADE",
  });

  ActivePosition.hasMany(models.HRVacancyAssignment, {
    foreignKey: "job_id",
    sourceKey: "job_id",
  });
};

module.exports = ActivePosition;