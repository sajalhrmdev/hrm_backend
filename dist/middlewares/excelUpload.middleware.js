import multer from "multer";
const excelUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
            "application/csv",
        ];
        const allowedExts = [".xlsx", ".xls", ".csv"];
        const ext = file.originalname
            .substring(file.originalname.lastIndexOf("."))
            .toLowerCase();
        if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only .xlsx, .xls, and .csv files are allowed."));
        }
    },
});
export default excelUpload;
