const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define("Notification", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [
        [
          "candidate",
          "vacancy",
          "approval",
          "totalMaster",
          "aboutToJoin",
          "newlyJoined",
          "bufferData",
          "rejected",
          "upload",
          "activeList",
        ],
      ],
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recipientEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Notification;
