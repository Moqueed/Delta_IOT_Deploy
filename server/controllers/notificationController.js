const Notification = require("../models/Notification");

exports.getNotificationsByEmail = async (req, res) => {
  try {
    const { email } = req.params;        // from URL params
    const { type } = req.query;          // from query string

    const where = { recipientEmail: email };
    if (type) {
      where.type = type;
    }

    const notifications = await Notification.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};


exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.update({ read: true }, { where: { id } });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};
