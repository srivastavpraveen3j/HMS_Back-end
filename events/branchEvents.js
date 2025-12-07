// events/branchEvents.js
import eventBus from "../lib/eventBus.js";
import { invitePlaformUser } from "../services/platformUserService.js";
import { generateInviteCode } from "../utils/jwtUtils.js";
import emailService from "../services/emailService.js";

/**
 * SIDE EFFECTS for Branch Lifecycle Events
 */

/**
 * Branch Created → invite user, send email, seed namespace
 */
eventBus.on("branch.created", async ({ branch, payload }) => {
  try {
    console.log(`🌱 Branch created event received: ${branch.name}`);

    // 1️⃣ Generate invite token and create initial user
    const inviteToken = generateInviteCode(payload.name);
    const user = await invitePlaformUser({
      name: payload.name,
      email: payload.contact_email,
      inviteToken,
    });

    console.log(`👤 Invite user created: ${user.email}`);

    // 2️⃣ Send welcome email
    const subject = `Welcome ${payload.name} to HIMS System`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9;">
        <h1 style="color: #2c3e50;">Welcome to Our SaaS Platform!</h1>
        <p style="font-size: 18px; color: #555;">
          We're excited to have you on board. Explore features, manage your data, and grow your business with ease.
        </p>
        <a href="${process.env.FRONTEND_URL}?token=${inviteToken}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Get Started
        </a>
      </div>
    `;
    emailService.sendEmail(payload.contact_email, subject, htmlContent);
    console.log(`📧 Welcome email sent to: ${payload.contact_email}`);

    // 3️⃣ Trigger namespace seeding workflow (permissions, roles, users)
    eventBus.emit("namespace.created", branch);

  } catch (err) {
    console.error("❌ Error handling branch.created event:", err);
  }
});

/**
 * Branch Activated → optional side effects (audit/logging)
 */
eventBus.on("branch.activated", async ({ branch }) => {
  try {
    console.log(`✅ Branch activated: ${branch.name}`);
    // Add any additional logic here (audit logs, notifications, etc.)
  } catch (err) {
    console.error("❌ Error handling branch.activated event:", err);
  }
});

/**
 * Branch Deactivated → optional side effects (audit/logging)
 */
eventBus.on("branch.deactivated", async ({ branch }) => {
  try {
    console.log(`⚠️ Branch deactivated: ${branch.name}`);
    // Add additional logic if needed
  } catch (err) {
    console.error("❌ Error handling branch.deactivated event:", err);
  }
});

/**
 * Branch Deleted → optional side effects (cleanup, audit)
 */
eventBus.on("branch.deleted", async ({ branch }) => {
  try {
    console.log(`🗑️ Branch deleted: ${branch.name}`);
    // Optional: cleanup associated users, permissions, etc.
  } catch (err) {
    console.error("❌ Error handling branch.deleted event:", err);
  }
});
