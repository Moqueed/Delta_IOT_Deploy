const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Admin", "HR"]], // Sequelize-level validation
      },
    },
  },
  {
    tableName: "users", // 👈 Force Sequelize to stick to 'users'
  }
);

module.exports = User;
