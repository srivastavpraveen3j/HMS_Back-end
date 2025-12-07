import { getHeaderConfig, updateHeaderConfig } from "../services/headerConfigService.js";
import { s3Client, BUCKET_NAME } from "../constants/S3config.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import LetterHeaderConfig from "../models/HeaderConfig.js";

export async function getConfig(req, res) {
  try {
    const config = await getHeaderConfig();
    res.status(200).json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function saveConfig(req, res) {
  try {
    const updated = await updateHeaderConfig(req.body);
    res.status(200).json({ success: true, config: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function uploadHeaderLogo(req, res) {
  try {
    if (!req.file || !req.file.location) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const config = await LetterHeaderConfig.findOne();
    if (config && config.s3Key) {
      try {
        await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: config.s3Key }));
      } catch (err) {
        console.warn("Failed to delete previous logo file:", err.message);
      }
    }

    const updatedConfig = await LetterHeaderConfig.findOneAndUpdate(
      {},
      { logoUrl: req.file.location, s3Key: req.file.key },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, logoUrl: req.file.location, s3Key: req.file.key, config: updatedConfig });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}