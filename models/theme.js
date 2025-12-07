import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    sidebarColor: { type: String, default: "#660000" },
    dropdownColor: { type: String, default: "#660000" },
    footerColor: { type: String, default: "#660000" },
    primaryColor: { type: String, default: "#008b8b" }, // ✅ add this
    sidebarwidth: { type: String, default: "260px" },
    sidebarcollapsedwidth: { type: String, default: "90px" },
    navlinktext: { type: String, default: "16px" },
    dropdownitemtext: { type: String, default: "14px" },
    navlinktextcolor: { type: String, default: "#008b8b" },
    dropdownitemtextcolor: { type: String, default: "#008b8b" },
    navlinkfont: { type: String, default: "Arial, sans-serif" },
    dropdownitemfont: { type: String, default: "Arial, sans-serif" },
  },
  { timestamps: true }
);

export default mongoose.model("Theme", themeSchema);
