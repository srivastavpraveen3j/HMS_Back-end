import fs from "fs";
import path from "path";

// 🔹 Load templates once at startup
const templatesPath = path.resolve("templates/emailTemplates.json");
const templates = JSON.parse(fs.readFileSync(templatesPath, "utf-8"));

/**
 * Fetches and fills an email template.
 * 
 * @param {string} templateName - The key name from emailTemplates.json
 * @param {Object} data - Key-value pairs to replace in the template
 * @returns {{ subject: string, body: string }} - Final formatted subject and body
 */
export function getEmailTemplate(templateName, data = {}) {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found.`);
  }

  const replacePlaceholders = (text) => {
    return text.replace(/{{(.*?)}}/g, (_, key) => {
      return data[key.trim()] ?? `{{${key}}}`;
    });
  };

  return {
    subject: replacePlaceholders(template.subject),
    body: replacePlaceholders(template.body)
  };
}
