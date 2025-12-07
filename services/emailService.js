import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

class EmailService {
  constructor(email, password) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: password
      }
    });
  }

  // ✅ ENHANCED: Generic method to send email with optional attachments
  async sendEmail(to, subject, htmlContent, attachments = []) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
      ...(attachments.length > 0 && { attachments }) // Only add attachments if they exist
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  // ✅ NEW: Method to send Purchase Order email with PDF
  async sendPurchaseOrderEmail(vendorEmail, poData, pdfBuffer) {
    const htmlContent = this.generatePOEmailTemplate(poData);
    
    const attachments = [
      {
        filename: `PO-${poData.poNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ];

    return await this.sendEmail(
      vendorEmail,
      `Purchase Order ${poData.poNumber} - PP Maniya Hospital`,
      htmlContent,
      attachments
    );
  }

  // ✅ NEW: Generate HTML template for PO email
  generatePOEmailTemplate(poData) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Purchase Order Generated</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">PP Maniya Children's Super Speciality Hospital</p>
      </div>
      
      <div style="padding: 20px; background: #f8f9fa;">
        <h2 style="color: #2c3e50; margin-top: 0;">Dear ${poData.vendor.name},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          We are pleased to share our Purchase Order with the following details:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a90e2; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50; width: 140px;">📋 PO Number:</td>
              <td style="padding: 8px 0; color: #333;">${poData.poNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">📅 Order Date:</td>
              <td style="padding: 8px 0; color: #333;">${new Date(poData.createdAt || new Date()).toLocaleDateString('en-GB')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">🚚 Delivery Date:</td>
              <td style="padding: 8px 0; color: #333;">${new Date(poData.deliveryDate).toLocaleDateString('en-GB')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">💰 Total Amount:</td>
              <td style="padding: 8px 0; color: #27ae60; font-weight: bold; font-size: 18px;">₹${poData.total?.toLocaleString('en-IN') || '0'}</td>
            </tr>
          </table>
        </div>
        
        <h3 style="color: #2c3e50; margin: 25px 0 15px 0;">📦 Items Ordered:</h3>
        <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #4a90e2; color: white;">
                <th style="padding: 12px 8px; text-align: left; font-weight: 600;">#</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600;">Item Name</th>
                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${poData.items?.map((item, index) => `
                <tr style="border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                  <td style="padding: 12px 8px; color: #666;">${index + 1}</td>
                  <td style="padding: 12px 8px;">
                    <div style="font-weight: 500; color: #2c3e50;">${item.name}</div>
                    ${item.category ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">${item.category}</div>` : ''}
                  </td>
                  <td style="padding: 12px 8px; text-align: center; font-weight: 500;">${item.quantity}</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: 500; color: #27ae60;">₹${item.totalPrice?.toLocaleString('en-IN') || '0'}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #888;">No items found</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <div style="background: #fff9c4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f0c419;">
          <h4 style="margin: 0 0 15px 0; color: #d68910; display: flex; align-items: center;">
            📋 Important Terms & Conditions:
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
            <li><strong>Payment Terms:</strong> ${poData.paymentTerms || '30 days from invoice date'}</li>
            <li><strong>Delivery Terms:</strong> ${poData.deliveryTerms || 'FOB destination'}</li>
            <li><strong>Warranty Period:</strong> ${poData.warrantyPeriod || '30 days'}</li>
            <li><strong>Quality Standards:</strong> All items must meet specified requirements</li>
          </ul>
        </div>
        
        ${poData.specialInstructions ? `
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h4 style="margin: 0 0 10px 0; color: #1976d2;">📝 Special Instructions:</h4>
          <p style="margin: 0; color: #666; line-height: 1.6; font-style: italic;">${poData.specialInstructions}</p>
        </div>
        ` : ''}
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border-left: 4px solid #27ae60;">
          <h4 style="margin: 0 0 10px 0; color: #27ae60;">📎 Attachment Included</h4>
          <p style="margin: 0; color: #666;">
            Please find the detailed <strong>Purchase Order PDF</strong> attached to this email.
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin: 25px 0;">
          If you have any questions regarding this purchase order, please don't hesitate to contact us at 
          <a href="mailto:info@ppmaniya.com" style="color: #4a90e2; text-decoration: none;">info@ppmaniya.com</a> 
          or call us at <strong>+91-9830456710</strong>.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for your continued partnership and prompt service.
        </p>
        
        <div style="margin: 30px 0 0 0; padding: 20px; background: #2c3e50; color: white; border-radius: 8px; text-align: center;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">
            PP Maniya Children's Super Speciality Hospital
          </div>
          <div style="opacity: 0.9; font-size: 14px; margin-bottom: 8px;">
            And Maternity Home, Laparoscopy & Test Tube Baby Centre
          </div>
          <div style="font-size: 12px; opacity: 0.8;">
            📞 +91-9830456710 | 📧 info@ppmaniya.com | 🌐 www.ppmaniya.com
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding: 15px; background: #f1f1f1; color: #888; font-size: 11px;">
        This is an automated email. Please do not reply to this message.<br>
        © 2025 PP Maniya Hospital. All rights reserved.
      </div>
    </div>`;
  }

  // ✅ NEW: Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASS;

export default new EmailService(EMAIL_USER, EMAIL_PASSWORD);
