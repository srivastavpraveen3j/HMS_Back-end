// utils/TenantConnectionManager.js
import mongoose from "mongoose";

class TenantConnectionManager {
  constructor() {
    this.connections = {}; // { apiKey: { conn, timer } }
    this.TIMEOUT = 60 * 60 * 1000; // 1 hour
  }

  /**
   * Connect to tenant DB dynamically
   * @param {string} apiKey - Tenant API Key
   * @param {string} dbURI - Full Mongo URI for this tenant
   * @returns {mongoose.Connection}
   */
  async getConnection(apiKey, dbURI) {
    // If already connected, reset the timeout and return
    if (this.connections[apiKey]) {
      clearTimeout(this.connections[apiKey].timer);

      this.connections[apiKey].timer = setTimeout(() => {
        this.disconnect(apiKey);
      }, this.TIMEOUT);

      return this.connections[apiKey].conn;
    }

    // Create new connection
    const conn = await mongoose.createConnection(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Set auto-disconnect after timeout
    const timer = setTimeout(() => {
      this.disconnect(apiKey);
    }, this.TIMEOUT);

    this.connections[apiKey] = { conn, timer };
    console.log(`Connected to tenant DB for API key: ${apiKey}`);

    return conn;
  }

  /**
   * Disconnect from tenant DB
   */
  async disconnect(apiKey) {
    if (this.connections[apiKey]) {
      await this.connections[apiKey].conn.close();
      clearTimeout(this.connections[apiKey].timer);
      delete this.connections[apiKey];
      console.log(`Disconnected tenant DB for API key: ${apiKey}`);
    }
  }
}

export default new TenantConnectionManager();
