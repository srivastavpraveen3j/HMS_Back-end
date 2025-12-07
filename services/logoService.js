// services/logoService.js - FULLY CORRECTED VERSION
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, S3_FOLDER } from "../constants/S3config.js";
import Logo from "../models/logo.js";

// Dynamic default logo handling - no hardcoded values
const DEFAULT_LOGO_KEY = "default-logo";

export async function getCurrentLogoDoc() {
  // console.log('getCurrentLogoDoc called');
  return await Logo.findOne({ key: "siteLogo" }).lean();
}

export async function getDefaultLogoDoc() {
  // console.log('getDefaultLogoDoc called');
  return await Logo.findOne({ key: DEFAULT_LOGO_KEY }).lean();
}

export async function getLogoInfo() {
  console.log('getLogoInfo called');
  
  // First check for custom logo
  const doc = await getCurrentLogoDoc();
  
  if (doc && doc.s3Url && doc.s3Key) {
    return {
      isDefault: false,
      filename: doc.filename || '',
      s3Key: doc.s3Key || '',
      s3Url: doc.s3Url || '',
      mimetype: doc.mimetype || 'image/jpeg',
      size: doc.size || 0,
      updatedAt: doc.updatedAt || new Date(),
      shapeConfig: doc.shapeConfig || getDefaultShapeConfig()
    };
  }
  
  // Check for default logo in database
  const defaultDoc = await getDefaultLogoDoc();
  if (defaultDoc && defaultDoc.s3Url && defaultDoc.s3Key) {
    return {
      isDefault: true,
      filename: defaultDoc.filename || '',
      s3Key: defaultDoc.s3Key || '',
      s3Url: defaultDoc.s3Url || '',
      mimetype: defaultDoc.mimetype || 'image/jpeg',
      size: defaultDoc.size || 0,
      updatedAt: defaultDoc.updatedAt || new Date(),
      shapeConfig: defaultDoc.shapeConfig || getDefaultShapeConfig()
    };
  }
  
  // No logos found - return error instead of hardcoded fallback
  throw new Error("No logo found. Please upload a default logo first.");
}

function getDefaultShapeConfig() {
  return {
    type: 'rectangular',
    borderRadius: '0px',
    customRadius: {
      topLeft: '0px',
      topRight: '0px',
      bottomLeft: '0px',
      bottomRight: '0px'
    }
  };
}

export async function saveDefaultLogo(s3File, shapeConfig = null) {
  // console.log('saveDefaultLogo called with:', { file: !!s3File, shapeConfig });
  
  if (!s3File) throw new Error("No file provided");

  // Validate S3 file object
  if (!s3File.key || !s3File.location) {
    throw new Error("Invalid S3 file object - missing key or location");
  }

  // Delete existing default logo from S3 first
  const existingDefault = await getDefaultLogoDoc();
  if (existingDefault && existingDefault.s3Key) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: existingDefault.s3Key
      }));
      // console.log('Deleted old default logo from S3:', existingDefault.s3Key);
    } catch (deleteError) {
      console.warn('Failed to delete old default logo:', deleteError.message);
    }
  }

  // Prepare default logo data
  const updateData = {
    key: DEFAULT_LOGO_KEY,
    filename: s3File.key.split('/').pop() || 'default-logo',
    s3Key: s3File.key,
    s3Url: s3File.location,
    mimetype: s3File.mimetype || s3File.contentType || 'image/jpeg',
    size: s3File.size || 0,
    originalName: s3File.originalname || s3File.metadata?.originalName || 'default-logo',
    bucket: BUCKET_NAME,
    region: process.env.AWS_REGION || "ap-south-1",
    shapeConfig: shapeConfig || getDefaultShapeConfig()
  };

  // Save default logo to database
  const doc = await Logo.findOneAndUpdate(
    { key: DEFAULT_LOGO_KEY },
    updateData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Default logo saved successfully:', {
    filename: doc.filename,
    s3Key: doc.s3Key,
    s3Url: doc.s3Url
  });

  return doc.toObject();
}

export async function saveNewLogoWithShape(s3File, shapeConfig = null) {
  console.log('saveNewLogoWithShape called with:', { file: !!s3File, shapeConfig });
  
  if (!s3File) throw new Error("No file provided");

  // STEP 1: Delete existing custom logo from S3 (but preserve default)
  await cleanupOldLogo();

  // STEP 2: Validate S3 file object
  if (!s3File.key || !s3File.location) {
    throw new Error("Invalid S3 file object - missing key or location");
  }

  // STEP 3: Prepare update data
  const updateData = {
    key: "siteLogo", // Explicitly set the key
    filename: s3File.key.split('/').pop() || 'unknown-file',
    s3Key: s3File.key,
    s3Url: s3File.location,
    mimetype: s3File.mimetype || s3File.contentType || 'image/jpeg',
    size: s3File.size || 0,
    originalName: s3File.originalname || s3File.metadata?.originalName || s3File.key.split('/').pop(),
    bucket: BUCKET_NAME,
    region: process.env.AWS_REGION || "ap-south-1",
    shapeConfig: shapeConfig || getDefaultShapeConfig()
  };

  // STEP 4: Update database with new logo
  const doc = await Logo.findOneAndUpdate(
    { key: "siteLogo" },
    updateData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('New logo saved successfully:', {
    filename: doc.filename,
    s3Key: doc.s3Key,
    s3Url: doc.s3Url
  });

  return doc.toObject();
}

export async function cleanupOldLogo() {
  try {
    const existingDoc = await getCurrentLogoDoc();
    
    if (existingDoc && existingDoc.s3Key && typeof existingDoc.s3Key === 'string') {
      // Don't delete the default logo - check against default logo doc
      const defaultDoc = await getDefaultLogoDoc();
      
      if (defaultDoc && existingDoc.s3Key === defaultDoc.s3Key) {
        console.log('Skipping deletion of default logo:', existingDoc.s3Key);
        return;
      }
      
      console.log('Deleting old logo from S3:', existingDoc.s3Key);
      
      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: existingDoc.s3Key
      }));
      
      // console.log('Successfully deleted old logo:', existingDoc.s3Key);
    } else {
      // console.log('No existing custom logo to delete');
    }
  } catch (error) {
    console.warn('Failed to cleanup old logo:', error.message);
    // Don't throw error here - we want upload to continue even if cleanup fails
  }
}

export async function saveNewLogo(s3File) {
  return await saveNewLogoWithShape(s3File, null);
}

export async function deleteLogoFromS3(s3Key) {
  if (!s3Key || typeof s3Key !== 'string') {
    // console.log('Invalid s3Key provided for deletion');
    return;
  }
  
  // Don't delete default logos - check against database
  const defaultDoc = await getDefaultLogoDoc();
  if (defaultDoc && s3Key === defaultDoc.s3Key) {
    // console.log('Refusing to delete default logo:', s3Key);
    return;
  }
  
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    }));
    console.log('Successfully deleted from S3:', s3Key);
  } catch (error) {
    console.error('Failed to delete from S3:', error.message);
    throw error;
  }
}

export async function resetToDefaultLogo() {
  // console.log('=== RESET TO DEFAULT LOGO ===');
  
  // Clean up existing custom logo
  await cleanupOldLogo();
  
  // Remove custom logo record from database
  await Logo.deleteOne({ key: "siteLogo" });
  
  // Get default logo info
  const defaultDoc = await getDefaultLogoDoc();
  if (!defaultDoc) {
    throw new Error("No default logo found in database. Please upload a default logo first using POST /v1/logo/default");
  }
  
  console.log('Reset to default completed');
  
  return {
    success: true,
    message: "Reset to default logo successfully",
    url: defaultDoc.s3Url,
    s3Url: defaultDoc.s3Url,
    isDefault: true,
    filename: defaultDoc.filename,
    s3Key: defaultDoc.s3Key,
    shapeConfig: defaultDoc.shapeConfig || getDefaultShapeConfig()
  };
}

// Utility function to check if default logo exists in S3
export async function ensureDefaultLogoExists() {
  try {
    const defaultDoc = await getDefaultLogoDoc();
    
    if (!defaultDoc || !defaultDoc.s3Key) {
      console.warn('No default logo found in database');
      return false;
    }
    
    // Check if default logo exists in S3
    await s3Client.send(new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: defaultDoc.s3Key
    }));
    
    console.log('Default logo exists in S3:', defaultDoc.s3Key);
    return true;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      console.warn('Default logo not found in S3:', error.message);
      return false;
    }
    console.error('Error checking default logo:', error.message);
    return false;
  }
}
