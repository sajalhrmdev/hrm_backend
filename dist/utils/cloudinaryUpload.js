import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
export const uploadToCloudinary = async (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "image",
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result) {
                return reject(new Error("Cloudinary upload failed"));
            }
            resolve(result);
        });
        Readable.from(buffer).pipe(uploadStream);
    });
};
