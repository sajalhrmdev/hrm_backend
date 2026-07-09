import axios from "axios";
import FormData from "form-data";
import { registerEmployeeFaceService, getEmployeeFaceService, deleteEmployeeFaceService, findEmployeeFace, } from "./employeeFace.service.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { deleteImageFromCloudinary } from "../../utils/cloudinaryDelete.js";
// export const registerEmployeeFace = async (req: Request, res: Response) => {
//   try {
//     const employeeId = Number(req.params.employeeId);
//     const imageUrl = req.file?.path;
//     if (!imageUrl) {
//       throw new Error("Image is required");
//     }
//     // ==========================
//     // SEND IMAGE TO PYTHON
//     // ==========================
//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(imageUrl));
//     const pythonResponse = await axios.post(
//       "http://localhost:8000/embedding",
//       formData,
//       {
//         headers: formData.getHeaders(),
//       },
//     );
//     if (!pythonResponse.data?.success) {
//       throw new Error(
//         pythonResponse.data?.message || "Failed to generate embedding",
//       );
//     }
//     const embedding = pythonResponse.data.embedding;
//     if (!Array.isArray(embedding) || embedding.length === 0) {
//       throw new Error("Invalid embedding");
//     }
//     // ==========================
//     // SAVE TO DB
//     // ==========================
//     const data = await registerEmployeeFaceService(
//       employeeId,
//       imageUrl,
//       embedding,
//     );
//     return res.status(201).json({
//       success: true,
//       data,
//     });
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to register face",
//     });
//   }
// };
export const registerEmployeeFace = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);
        if (!req.file) {
            throw new Error("Image is required.");
        }
        // Existing face (if any)
        const existingFace = await findEmployeeFace(employeeId);
        // Prepare form-data for Python
        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        // Run Python + Cloudinary in parallel
        const [pythonResponse, uploadResult] = await Promise.all([
            axios.post("http://localhost:8000/embedding", formData, {
                headers: formData.getHeaders(),
            }),
            uploadToCloudinary(req.file.buffer, "employee-faces"),
        ]);
        if (!pythonResponse.data?.success) {
            throw new Error(pythonResponse.data?.message || "Failed to generate embedding");
        }
        const embedding = pythonResponse.data.embedding;
        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("Invalid embedding.");
        }
        // Save DB
        const data = await registerEmployeeFaceService(employeeId, uploadResult.secure_url, uploadResult.public_id, embedding);
        // Delete old image after DB update
        if (existingFace) {
            try {
                await deleteImageFromCloudinary(existingFace.publicId);
            }
            catch (error) {
                console.error("Failed to delete old Cloudinary image:", error);
            }
        }
        return res.status(201).json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to register employee face.",
        });
    }
};
export const getEmployeeFace = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);
        const data = await getEmployeeFaceService(employeeId);
        return res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const deleteEmployeeFace = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);
        const face = await getEmployeeFaceService(employeeId);
        await deleteImageFromCloudinary(face.publicId);
        await deleteEmployeeFaceService(employeeId);
        return res.json({
            success: true,
            message: "Face deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
