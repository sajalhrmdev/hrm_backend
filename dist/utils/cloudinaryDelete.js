import cloudinary from "../config/cloudinary.js";
export const deleteImageFromCloudinary = async (publicId) => {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Failed to delete image from Cloudinary.");
    }
};
