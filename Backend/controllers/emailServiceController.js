const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Notification templates
const sendClassAssignmentNotification = async (user, className, role, students = []) => {
  const subject = `You've been assigned to ${className}`;
  
  // Generate student list HTML
  let studentListHtml = '';
  if (students.length > 0) {
    studentListHtml = `
      <div style="margin: 15px 0;">
        <h3>Students in this class:</h3>
        <ul style="padding-left: 20px;">
          ${students.map(student => `<li>${student.Name} (${student.Email})</li>`).join('')}
        </ul>
      </div>
    `;
  } else {
    studentListHtml = `<p>There are currently no students assigned to this class.</p>`;
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Class Assignment Notification</h2>
      <p>Hello ${user.Name},</p>
      <p>You have been assigned as a <strong>${role}</strong> to the class: <strong>${className}</strong>.</p>
      <p>Please log in to your account to view more details.</p>
      ${studentListHtml}
      <p>Thank you,<br>E-tutor King Corporation</p>
    </div>
  `;

  return await sendEmail(user.Email, subject, html);
};

module.exports = {
  sendEmail,
  sendClassAssignmentNotification
};
