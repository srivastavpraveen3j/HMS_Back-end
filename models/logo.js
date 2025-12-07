import mongoose from "mongoose";

const LogoSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "siteLogo" },
    filename: { type: String, required: true },
    s3Key: { type: String, required: true }, // S3 object key
    s3Url: { type: String, required: true }, // Full S3 URL
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    originalName: { type: String, required: true },
    bucket: { type: String, required: true, default: "digitalks-crm-bucket" },
    region: { type: String, required: true, default: "ap-south-1" },
    // Shape customization properties
    shapeConfig: {
      type: {
        type: String,
        enum: ['rectangular', 'rounded', 'circular', 'custom'],
        default: 'rectangular'
      },
      borderRadius: { type: String, default: '0px' },
      customRadius: {
        topLeft: { type: String, default: '0px' },
        topRight: { type: String, default: '0px' },
        bottomLeft: { type: String, default: '0px' },
        bottomRight: { type: String, default: '0px' }
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Logo", LogoSchema);
