const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Unique filename
  },
});

// File filter (accept only PDF, DOC, DOCX)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    return cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  }
};

// Multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
