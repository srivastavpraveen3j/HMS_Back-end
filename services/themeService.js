import Theme from "../models/theme.js";  // Use capital "T"

export const getThemeService = async () => {
  let theme = await Theme.findOne().sort({ createdAt: -1 });
  if (!theme) {
    theme = new Theme();
    await theme.save();
  }
  return theme;
};


export const updateThemeService = async (themeData) => {
  console.log("Incoming themeData:", themeData);

  // This reliably overwrites any fields provided in themeData
  const theme = await Theme.findOneAndUpdate(
    {}, // Finds the latest (or filter by _id if needed: { _id: themeData._id })
    { $set: themeData },
    { new: true, upsert: true, runValidators: true } // Always return the updated document
  );

  console.log("Theme after update:", theme);
  return theme;
};



