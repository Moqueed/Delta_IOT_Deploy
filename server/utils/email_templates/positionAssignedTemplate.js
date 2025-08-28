const getPositionAssignedTemplate = (positionTitle, positionDescription) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>New Position Assigned</title>
          <style>
            body {
              font-family: 'Segoe UI', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .header h2 {
              margin: 0;
              color: #333;
            }
            .content {
              margin-top: 20px;
              color: #555;
            }
            .content ul {
              padding-left: 20px;
            }
            .footer {
              margin-top: 30px;
              font-size: 13px;
              color: #aaa;
              text-align: center;
            }
            .highlight {
              color: #007bff;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Position Assigned</h2>
            </div>
            <div class="content">
              <p>Dear HR,</p>
              <p>You have been assigned a new position in the system. Please find the details below:</p>
              <ul>
                <li><strong>Title:</strong> <span class="highlight">${positionTitle}</span></li>
                <li><strong>Description:</strong> ${positionDescription}</li>
              </ul>
              <p>Kindly log in to your dashboard to review and proceed with the next steps.</p>
              <p>Regards,<br />Delta IoT Solutions</p>
            </div>
            <div class="footer">
              © 2025 Delta IoT Solutions. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
  module.exports = getPositionAssignedTemplate;
  