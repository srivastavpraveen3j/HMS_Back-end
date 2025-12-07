import { getThemeService, updateThemeService } from "../services/themeService.js";

export const getTheme = async (req, res, next) => {
  try {
    const theme = await getThemeService();
    res.json(theme);
  } catch (err) {
    next(err);
  }
};

export const updateTheme = async (req, res, next) => {
  try {
    console.log("🔥 UPDATE ENDPOINT HIT!");
    console.log("Request body:", req.body);
    console.log("navlinktext:", req.body.navlinktext);
    console.log("dropdownitemtext:", req.body.dropdownitemtext);
    
    const theme = await updateThemeService(req.body);
    
    console.log("Theme returned from service:", theme.toObject());
    
    res.json(theme);
  } catch (err) {
    next(err);
  }
};

