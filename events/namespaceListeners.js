// events/NamespaceEvent.js
import eventBus from "../libs/EventBusQueue.js";
import Namespace from "../models/NameSpace.js";
import generateApiKey from "../utils/genrateAPIkey.js";
import generateRandomDBURI from "../utils/generateHospitalDBURI.js";

/**
 * Event: namespace.created
 * Triggered when a new tenant/namespace is created
 */
eventBus.on("namespace.created", async ({ tenantId, name, contact_email }) => {
  try {
    const apiKey = generateApiKey(contact_email);
    const baseURI = process.env.BASE_URI;

    const data_connection_string = generateRandomDBURI(baseURI, name)

    const namespace = await Namespace.create({
      tenantId,
      name,
      contact_email,
      database_url: data_connection_string,
      apiKey,
      status: "active",
    });

    console.log(`✅ Namespace created: ${namespace.name} (${namespace.tenantId})`);
  } catch (err) {
    console.error("❌ Error creating namespace:", err.message);
  }
});

/**
 * Event: namespace.suspended
 * Triggered when an instance is suspended
 */
eventBus.on("namespace.suspended", async ({ tenantId }) => {
  try {
    const namespace = await Namespace.findOneAndUpdate(
      { tenantId },
      { status: "suspended" },
      { new: true }
    );

    if (namespace) {
      console.log(`⚠️ Namespace suspended: ${namespace.name} (${namespace.tenantId})`);
    }
  } catch (err) {
    console.error("❌ Error suspending namespace:", err.message);
  }
});

/**
 * Event: namespace.deleted
 * Triggered when an instance is deleted
 */
eventBus.on("namespace.deleted", async ({ tenantId }) => {
  try {
    const namespace = await Namespace.findOneAndDelete({ tenantId });

    if (namespace) {
      console.log(`🗑️ Namespace deleted: ${namespace.name} (${namespace.tenantId})`);
    }
  } catch (err) {
    console.error("❌ Error deleting namespace:", err.message);
  }
});
