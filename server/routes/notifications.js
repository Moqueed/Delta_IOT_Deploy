const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/:email", notificationController.getNotificationsByEmail);
router.put("/read/:id", notificationController.markAsRead);

module.exports = router;