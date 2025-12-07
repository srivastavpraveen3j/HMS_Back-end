// utils/NamespaceHelper.js
import crypto from "crypto";

export default class NamespaceHelper {
  constructor(baseMongoURI) {
    if (!baseMongoURI) throw new Error("MONGO_BASE_URI is required");
    this.baseMongoURI = baseMongoURI || process.env.BASE_URI;
  }

  static generateApiKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static generateDBName(prefix = "") {
    const randomPart = crypto.randomBytes(2).toString("hex"); // 4 hex chars
    return prefix ? `${prefix}_${randomPart}` : `db_${randomPart}`;
  }

  getDBURI(dbName) {
    if (!dbName) throw new Error("Database name is required");
    return `${this.baseMongoURI}/${dbName}?retryWrites=true&w=majority`;
  }
}