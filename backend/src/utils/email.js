const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `Portfolio <${process.env.EMAIL_FROM}>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

/**
 * Send contact form notification to admin
 */
const sendContactNotification = async (contactData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; margin: 20px 0; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; margin-top: 5px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${contactData.name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${contactData.email}</div>
          </div>
          ${contactData.phone ? `
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${contactData.phone}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${contactData.subject}</div>
          </div>
          <div class="field">
            <div class="label">Category:</div>
            <div class="value">${contactData.category}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${contactData.message}</div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from your portfolio website.</p>
          <p>Reply directly to ${contactData.email} to respond to this inquiry.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact: ${contactData.subject}`,
    replyTo: contactData.email,
    html,
    text: [
      'New Contact Form Submission',
      `Name: ${contactData.name}`,
      `Email: ${contactData.email}`,
      contactData.phone ? `Phone: ${contactData.phone}` : null,
      `Subject: ${contactData.subject}`,
      `Category: ${contactData.category}`,
      `Message: ${contactData.message}`
    ].filter(Boolean).join('\n')
  });
};

/**
 * Send auto-reply to contact form submitter
 */
const sendContactAutoReply = async (contactData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Reaching Out!</h1>
        </div>
        <div class="content">
          <p>Hi ${contactData.name},</p>
          <p>Thank you for your message. I've received your inquiry and will get back to you as soon as possible, typically within 24-48 hours.</p>
          <p>In the meantime, feel free to explore my portfolio and recent projects.</p>
          <p>Best regards,<br>Your Name</p>
        </div>
        <div class="footer">
          <p>This is an automated response. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: contactData.email,
    subject: 'Thank you for contacting me',
    html
  });
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to the Admin Panel</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Your account has been created successfully with ${user.role} access.</p>
          <p>You can now log in to the admin panel and start managing content.</p>
          <p>Best regards,<br>Admin Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to the Admin Panel',
    html
  });
};

module.exports = {
  sendEmail,
  sendContactNotification,
  sendContactAutoReply,
  sendWelcomeEmail
};
