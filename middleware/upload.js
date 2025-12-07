import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${Date.now()}${ext}`); // keep old files until service cleans them
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"].includes(
    file.mimetype
  );
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

export const uploadLogoMulter = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("logo");
