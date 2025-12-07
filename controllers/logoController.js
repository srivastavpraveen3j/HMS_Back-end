// controllers/logoController.js - FULLY CORRECTED VERSION
import Logo from "../models/logo.js";
import { 
  getCurrentLogoDoc, 
  saveNewLogoWithShape,
  saveDefaultLogo,
  getLogoInfo,
  deleteLogoFromS3,
  cleanupOldLogo,
  ensureDefaultLogoExists,
  resetToDefaultLogo
} from "../services/logoService.js";

export const uploadLogo = async (req, res, next) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // console.log('=== LOGO UPLOAD STARTED ===');
    console.log('Uploaded file details:', {
      originalname: req.file.originalname,
      key: req.file.key,
      location: req.file.location,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Parse shape configuration with better error handling
    let shapeConfig;
    try {
      shapeConfig = req.body.shapeConfig ? JSON.parse(req.body.shapeConfig) : {
        type: 'rectangular',
        borderRadius: '0px',
        customRadius: {
          topLeft: '0px',
          topRight: '0px',
          bottomLeft: '0px', 
          bottomRight: '0px'
        }
      };
    } catch (parseError) {
      console.warn('Failed to parse shapeConfig, using default:', parseError.message);
      shapeConfig = {
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
    
    // Save new logo (this will automatically replace the old one)
    const doc = await saveNewLogoWithShape(req.file, shapeConfig);
    
    // console.log('=== LOGO UPLOAD COMPLETED ===');
    // console.log('New logo URL:', doc.s3Url);

    res.status(201).json({
      success: true,
      message: "Logo uploaded successfully to S3 (old logo replaced)",
      url: doc.s3Url,
      s3Url: doc.s3Url,
      filename: doc.filename,
      mimetype: doc.mimetype,
      size: doc.size,
      updatedAt: doc.updatedAt,
      isDefault: false,
      s3Key: doc.s3Key,
      shapeConfig: doc.shapeConfig
    });

  } catch (err) {
    console.error('=== LOGO UPLOAD ERROR ===', err);
    
    // Clean up uploaded file if something went wrong after S3 upload
    if (req.file && req.file.key) {
      try {
        await deleteLogoFromS3(req.file.key);
        console.log('Cleaned up failed upload:', req.file.key);
      } catch (cleanupError) {
        console.warn('Failed to cleanup after error:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error during upload',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const uploadDefaultLogo = async (req, res, next) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // console.log('=== DEFAULT LOGO UPLOAD STARTED ===');
    console.log('Uploaded file details:', {
      originalname: req.file.originalname,
      key: req.file.key,
      location: req.file.location,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Parse shape configuration
    let shapeConfig;
    try {
      shapeConfig = req.body.shapeConfig ? JSON.parse(req.body.shapeConfig) : {
        type: 'rectangular',
        borderRadius: '0px',
        customRadius: {
          topLeft: '0px',
          topRight: '0px',
          bottomLeft: '0px', 
          bottomRight: '0px'
        }
      };
    } catch (parseError) {
      console.warn('Failed to parse shapeConfig, using default:', parseError.message);
      shapeConfig = {
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
    
    // Save as default logo
    const doc = await saveDefaultLogo(req.file, shapeConfig);
    
    // console.log('=== DEFAULT LOGO UPLOAD COMPLETED ===');
    // console.log('Default logo URL:', doc.s3Url);

    res.status(201).json({
      success: true,
      message: "Default logo uploaded successfully to S3",
      url: doc.s3Url,
      s3Url: doc.s3Url,
      filename: doc.filename,
      mimetype: doc.mimetype,
      size: doc.size,
      updatedAt: doc.updatedAt,
      isDefault: true,
      s3Key: doc.s3Key,
      shapeConfig: doc.shapeConfig
    });

  } catch (err) {
    console.error('=== DEFAULT LOGO UPLOAD ERROR ===', err);
    
    // Clean up uploaded file if something went wrong after S3 upload
    if (req.file && req.file.key) {
      try {
        await deleteLogoFromS3(req.file.key);
        // console.log('Cleaned up failed upload:', req.file.key);
      } catch (cleanupError) {
        console.warn('Failed to cleanup after error:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error during default logo upload',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getLogoMeta = async (req, res, next) => {
  try {
    // console.log('=== GET LOGO META ===');
    
    // Check if default logo exists
    const defaultExists = await ensureDefaultLogoExists();
    
    const logoInfo = await getLogoInfo();
    
    res.json({
      success: true,
      url: logoInfo.s3Url,
      s3Url: logoInfo.s3Url,
      filename: logoInfo.filename,
      updatedAt: logoInfo.updatedAt,
      mimetype: logoInfo.mimetype,
      size: logoInfo.size,
      isDefault: logoInfo.isDefault,
      s3Key: logoInfo.s3Key,
      shapeConfig: logoInfo.shapeConfig,
      defaultExists: defaultExists
    });
    
  } catch (err) {
    console.error('Error in getLogoMeta:', err);
    
    res.status(404).json({
      success: false,
      message: err.message || "No logo found",
      error: "NO_LOGO_FOUND",
      suggestion: "Upload a default logo using POST /v1/logo/default"
    });
  }
};

export const resetToDefaultLogoController = async (req, res, next) => {
  try {
    // console.log('=== RESET TO DEFAULT LOGO CONTROLLER ===');
    
    const result = await resetToDefaultLogo();
    
    res.json(result);
  } catch (err) {
    console.error('Error in resetToDefaultLogo:', err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to reset to default logo",
      error: "RESET_FAILED",
      suggestion: "Make sure you have uploaded a default logo first using POST /v1/logo/default"
    });
  }
};

export const updateLogoShape = async (req, res, next) => {
  try {
    // console.log('=== UPDATE LOGO SHAPE ===');
    // console.log('Request body:', req.body);
    
    const { shapeConfig } = req.body;
    
    if (!shapeConfig) {
      return res.status(400).json({ 
        success: false, 
        message: "Shape configuration is required" 
      });
    }

    // Validate shapeConfig structure
    const validTypes = ['rectangular', 'rounded', 'circular', 'custom'];
    if (!validTypes.includes(shapeConfig.type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid shape type. Must be one of: rectangular, rounded, circular, custom" 
      });
    }
    
    // Check if we have any logo to update shape for
    const currentLogo = await getCurrentLogoDoc();
    if (!currentLogo) {
      // If no custom logo, check if there's a default logo
      const logoInfo = await getLogoInfo();
      if (!logoInfo) {
        return res.status(404).json({
          success: false,
          message: "No logo found to update shape for",
          suggestion: "Upload a logo first"
        });
      }
    }
    
    const doc = await Logo.findOneAndUpdate(
      { key: "siteLogo" },
      { shapeConfig },
      { new: true, upsert: true }
    );
    
    console.log('Shape update result:', doc ? 'SUCCESS' : 'FAILED');
    
    res.json({
      success: true,
      message: "Logo shape updated successfully",
      shapeConfig: doc?.shapeConfig || shapeConfig,
      s3Url: doc?.s3Url || null
    });
  } catch (err) {
    console.error('=== UPDATE SHAPE ERROR ===', err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error during shape update"
    });
  }
};

export const getLogoFile = async (req, res, next) => {
  try {
    // console.log('=== GET LOGO FILE ===');
    
    const logoInfo = await getLogoInfo();
    
    if (!logoInfo.s3Url) {
      return res.status(404).json({
        success: false,
        message: "Logo URL not found"
      });
    }
    
    // For S3, redirect to the S3 URL
    console.log('Redirecting to:', logoInfo.s3Url);
    res.redirect(302, logoInfo.s3Url);
    
  } catch (err) {
    console.error('Error in getLogoFile:', err);
    
    res.status(404).json({
      success: false,
      message: err.message || "Logo not found",
      error: "LOGO_NOT_FOUND",
      suggestion: "Upload a default logo using POST /v1/logo/default"
    });
  }
};
