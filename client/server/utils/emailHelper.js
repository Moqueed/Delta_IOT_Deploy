const nodemailer = require('nodemailer');
const getPositionAssignedTemplate = require('./email_templates/positionAssignedTemplate');
require('dotenv').config();

//Assign a position to HR
const sendPositionMail = async ( positionTitle, positionDescription) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADMIN,
      pass: process.env.EMAIL_ADMIN_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADMIN,
    to: process.env.EMAIL_USER,
    subject: `New Position Allotted: ${positionTitle}`,
    html: getPositionAssignedTemplate(positionTitle, positionDescription),
  };

  await transporter.sendMail(mailOptions);
};


//assign candidate to HR
const path = require("path");

const sendAssignmentMail = async (data) => {
  const { hrName, candidateName, candidateEmail, position, contactNumber, resumePath, comments } = data;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.EMAIL_ADMIN_PASS,
  }
})

  const mailOptions = {
    from: process.env.EMAIL_ADMIN,
    to: process.env.EMAIL_USER,
    subject: `Candidate Assigned: ${candidateName}`,
    html: `
      <h3>Hello ${hrName},</h3>
      <p>A new candidate has been assigned to you:</p>
      <ul>
        <li><strong>Name:</strong> ${candidateName}</li>
        <li><strong>Email:</strong> ${candidateEmail}</li>
        <li><strong>Position:</strong> ${position}</li>
        <li><strong>Contact:</strong> ${contactNumber}</li>
        <li><strong>Comments:</strong> ${comments || "N/A"}</li>
      </ul>
      <p>Please review the details in your dashboard.</p>
    `,

    attachments: resumePath
    ? [
      {
        filename: path.basename(resumePath),
        path: path.join(__dirname, "..", resumePath),
      }
    ]
    : [],
  };

  await transporter.sendMail(mailOptions);
};


module.exports = {sendPositionMail, sendAssignmentMail};
