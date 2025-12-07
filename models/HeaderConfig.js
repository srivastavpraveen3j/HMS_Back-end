import mongoose from "mongoose";

const LetterHeaderConfigSchema = new mongoose.Schema({
  // HEADER AREA BASIC LAYOUT
  hospitalName: String,
  hospitalNameFontSize: { type: String, default: "2.4rem" },
  hospitalNameFontWeight: { type: String, default: "700" },
  hospitalNameFontColor: { type: String, default: "#8B4513" },
  hospitalNameFontFamily: { type: String, default: "Arial, sans-serif" },
  hospitalNameLineHeight: { type: String, default: "1.15" },

  hospitalSubtitle: String,
  subtitleFontSize: { type: String, default: "1.1rem" },
  subtitleFontWeight: { type: String, default: "500" },
  subtitleFontColor: { type: String, default: "#8B4513" },
  subtitleFontFamily: { type: String, default: "Arial, sans-serif" },
  subtitleLineHeight: { type: String, default: "1.2" },

  tagline: String,
  taglineFontSize: { type: String, default: "1.08rem" },
  taglineFontWeight: { type: String, default: "normal" },
  taglineFontColor: { type: String, default: "#555" },
  taglineFontFamily: { type: String, default: "Arial, sans-serif" },
  taglineLineHeight: { type: String, default: "1.2" },

  // CONTACT ROW
  address: String,
  phone: String,
  email: String,
  website: String,
  contactFontSize: { type: String, default: "1.04rem" },
  contactFontWeight: { type: String, default: "400" },
  contactFontColor: { type: String, default: "#8B4513" },
  contactFontFamily: { type: String, default: "Arial, sans-serif" },
  contactLineHeight: { type: String, default: "1.1" },
  
  // LAYOUT & APPEARANCE
  logoUrl: String,
  s3Key: String,
  logoPosition: { type: String, enum: ["left", "center", "right"], default: "right" },
  headerAlign: { type: String, enum: ["left", "center", "right"], default: "center" },
  headerWidth: { type: String, default: "3in" },
  headerHeight: { type: String, default: "2in" },
  backgroundColor: { type: String, default: "#fff" },

  headerGap: { type: String, default: "28px" },
  marginTop: { type: String, default: "0" },
  marginBottom: { type: String, default: "0" },
  marginSides: { type: String, default: "auto" },

  logoMaxWidth: { type: String, default: "80px" },
  logoMaxHeight: { type: String, default: "80px" },
  logoBorderRadius: { type: String, default: "12px" },
  // Add additional fine-grained keys as needed
}, { timestamps: true });

export default mongoose.model("LetterHeaderConfig", LetterHeaderConfigSchema);
