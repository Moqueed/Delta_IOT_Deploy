const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust path as needed

const Upload = sequelize.define("Upload", {
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploaded_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "uploads",
  timestamps: true,
});

module.exports = Upload;
