import LetterHeaderConfig from "../models/HeaderConfig.js";

// GET or create default

export async function getHeaderConfig() {
  let config = await LetterHeaderConfig.findOne().lean();
  if (!config) {
    config = await LetterHeaderConfig.create({}); // model defaults used
    config = config.toObject();
  }
  return config;
}

export async function updateHeaderConfig(settings) {
  const config = await LetterHeaderConfig.findOne();
  let doc;
  if (!config) {
    doc = await LetterHeaderConfig.create(settings);
  } else {
    Object.assign(config, settings);
    doc = await config.save();
  }
  return doc.toObject();
}