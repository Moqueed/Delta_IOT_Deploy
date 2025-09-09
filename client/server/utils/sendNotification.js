const Notification = require("../models/Notification");

const sendNotification = async ({ title, message, recipientEmail, type }) => {
  try {
    await Notification.create({
      title,
      message,
      recipientEmail,
      type,      
      read: false,
    });
    console.log(`✅ Notification (${type}) sent to ${recipientEmail}`);
  } catch (err) {
    console.error("❌ Error sending notification:", err.message);
  }
};


module.exports = sendNotification;
