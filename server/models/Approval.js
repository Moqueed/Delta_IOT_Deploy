const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ActiveList = require("./ActiveList");

const Approval = sequelize.define(
  "Approval",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    active_list_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "activeList",
        key: "id",
      },
    },
    approval_status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
    HR_name: { type: DataTypes.STRING, allowNull: false },
    HR_mail: { type: DataTypes.STRING, allowNull: false },
    entry_date: { type: DataTypes.DATEONLY, allowNull: false },
    candidate_name: { type: DataTypes.STRING, allowNull: false },
    position: {
      type: DataTypes.ENUM(
        "Python Developer",
        "EMD Developer",
        "Intern",
        "Trainee",
        "C++ Developer",
        "Accounts",
        "Developer"
      ),
      allowNull: false,
    },
    department: {
      type: DataTypes.ENUM(
        "IT",
        "EMDB",
        "HIGH",
        "Financial",
        "Python",
        "Engineering"
      ),
      allowNull: false,
    },
    // skills: { type: DataTypes.TEXT },
    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("skills");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("skills", JSON.stringify(value || []));
      },
    },
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
    },
    profile_stage: {
      type: DataTypes.ENUM("open", "closed"),
      allowNull: true,
      defaultValue: "open",
    },
    status_date: { type: DataTypes.DATEONLY, allowNull: false },
    candidate_email_id: { type: DataTypes.STRING, allowNull: false },
    contact_number: { type: DataTypes.STRING, allowNull: false },
    current_company: { type: DataTypes.STRING },
    current_location: { type: DataTypes.STRING },
    permanent_location: { type: DataTypes.STRING },
    qualification: { type: DataTypes.STRING },
    experience: { type: DataTypes.INTEGER },
    current_ctc: { type: DataTypes.STRING },
    expected_ctc: { type: DataTypes.STRING },
    band: { type: DataTypes.ENUM("L0", "L1", "L2", "L3", "L4") },
    reference: { type: DataTypes.STRING },
    notice_period: { type: DataTypes.STRING },
    comments: { type: DataTypes.TEXT },
    attachments: { type: DataTypes.STRING, allowNull: true },
    requested_by: { type: DataTypes.STRING, allowNull: false },
    approved_by: { type: DataTypes.STRING },
  },
  {
    tableName: "approvals",
    timestamps: false,
  }
);

// Setup association
ActiveList.hasMany(Approval, {
  foreignKey: "active_list_id",
  as: "active_list_approvals",
});
Approval.belongsTo(ActiveList, {
  foreignKey: "active_list_id",
  as: "related_active_list",
});

// Optional: Move hook logic to controller instead for more control
// If you still want to update ActiveList & insert to Rejected here, keep this:
// Approval.afterUpdate(async (approval) => {
//   try {
//     const { approval_status, candidate_name, requested_progress_status, comments, approved_by } = approval;

//     if (approval_status === "Approved") {
//       await ActiveList.update(
//         { progress_status: requested_progress_status },
//         { where: { id: approval.active_list_id } }
//       );

//       console.log(`✅ ActiveList updated for Candidate: ${candidate_name}`);
//     } else if (approval_status === "Rejected") {
//       const Rejected = require("./Rejected");
//       await Rejected.create({
//         ...approval.dataValues,
//         rejection_comments: comments,
//       });

//       console.log(`🚫 Candidate ${candidate_name} moved to Rejected table`);
//     }
//   } catch (error) {
//     console.error("❌ Error processing approval logic:", error);
//   }
// });

module.exports = Approval;
