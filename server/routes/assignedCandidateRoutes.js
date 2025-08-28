const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { createNewCandidate } = require("../controllers/assignToHRController");
const router = express.Router();

router.post("/assign", upload.single("attachments"), createNewCandidate);

module.exports = router;