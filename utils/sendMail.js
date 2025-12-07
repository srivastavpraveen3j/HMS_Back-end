import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { formatTemplate } from "../utils/emailTemplateFormatter.js";
import { emailTemp } from "../constants/templates.js";

dotenv.config();

// ✅ Create only ONE transporter, at the top
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendEmail = async (to, templateKey, templateVariables = {}, attachments = []) => {
  try {
    const emailType = emailTemp[templateKey];
    if (!emailType) throw new Error(`Email template '${templateKey}' not found`);

    const subject = formatTemplate(emailType.subject, templateVariables);
    const body = formatTemplate(emailType.body, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text: body,
      attachments,  // ✅ support CSV or other attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
};
