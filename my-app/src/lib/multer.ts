import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => {
    return {
      folder: "recipes",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    };
  },
});

const upload = multer({ storage });

export default upload;