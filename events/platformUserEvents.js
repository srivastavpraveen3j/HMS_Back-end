import eventBus from "../libs/EventBusQueue.js";
import emailService from "../services/emailService.js";
// import { createTenant } from "../services/TenantService.js";
// import generateApiKey from "../utils/genrateAPIkey.js";
import { createNamespace } from "../services/Namespace.js";
import { linkUserToNamespace } from "../services/Namespace.js";
import generatePrefixedDBURI from "../utils/generateHospitalDBURI.js"; // function we defined earlier

eventBus.on("user.invited", async ({ email, name, inviteToken }) => {
  const subject = `Welcome ${name} to HIMS System – Our Team Will Connect With You Shortly`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9;">
      <h1 style="color: #2c3e50;">Welcome to Our SaaS Platform!</h1>
      <p style="font-size: 18px; color: #555;">
        You're invited. Explore features, manage your data, and grow your hospital network with ease.
      </p>
      <a href="${process.env.FRONTEND_URL}?token=${inviteToken}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
        Get Started
      </a>
    </div>
  `;
  await emailService.sendEmail(email, subject, htmlContent);
});

eventBus.on("user.activated", async ({ user, password }) => {
  const subject = `Welcome ${user.name} to HIMS System – Your Account is Ready`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9;">
      <h1 style="color: #2c3e50;">Welcome to Our SaaS Platform!</h1>
      <p style="font-size: 18px; color: #555;">
        Your account has been activated successfully.
      </p>
      <p style="font-size: 16px; color: #333;">
        Email: ${user.email}<br/>
        Password: ${password}
      </p>
    </div>
  `;
  await emailService.sendEmail(user.email, subject, htmlContent);

  // 🔑 Example: auto-create tenant + API key
  // const APIkey = generateApiKey(user.email);
  // await createTenant({ name: user.name, namespace: APIkey, contact_email: user.email });
});


eventBus.on("user.activated", async ({ user, password }) => {
  try {
    // ✅ Generate a random 3-char prefix (letters only)
    const prefix = Math.random().toString(36).substring(2, 5).toUpperCase();

    // ✅ Build Namespace fields
    const DND = `${prefix}_${process.env.DEFAULT_NAME_NAMESPACE}`;
    const DEM = `${prefix}_${process.env.DEFAULT_EMAIL_NAMESPACE}`;
    const DAN = `${prefix}_${process.env.DEFAULT_API_KEY_NAMESPACE}`;

    // ✅ Generate random DB URI for this Namespace
    const database_url = generatePrefixedDBURI(process.env.BASE_URI);

    const data = {
      name: DND,
      contact_email: DEM,
      api_key: DAN,
      database_url, // link DB here
    };

    // ✅ Create Namespace
    const NameSpace = await createNamespace(data);

    // ✅ Link user to Namespace
    await linkUserToNamespace(user, NameSpace);

    console.log("User linked to namespace:", user);
    console.log("Namespace DB URI:", database_url);
  } catch (error) {
    console.error("Error activating user and creating namespace:", error);
  }
});
