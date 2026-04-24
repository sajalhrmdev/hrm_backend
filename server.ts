import express, { Request, Response } from "express";
import deparmentRoutes from "./routes/department.routes.js";
import designationRoutes from "./routes/designation.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
// import attendanceRoutes from "./routes/attendance.routes.js";
import globalRoleRoutes from "./routes/globalRole.routes.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import companyRoutes from "./routes/company.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import salaryStructureRoutes from "./routes/salaryStructure.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import authRoutes from "./routes/auth.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import { verifyToken } from "./controllers/middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { companyAccessMiddleware } from "./middlewares/companyAccess.middleware.js";

const app = express(); 
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://hrm-frontend-ashy.vercel.app",
    ],
    credentials: true,
  }),
);
const port = process.env.PORT || 3000;
app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/membership",membershipRoutes)
app.use("/api/v1/global-roles", globalRoleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/companies", companyRoutes);

app.use("/api/v1/roles", roleRoutes);

app.use("/api/v1/designations", designationRoutes);
app.use("/api/v1/department", deparmentRoutes);
app.use("/api/v1/employee", employeeRoutes);
app.use(
  "/api/v1/attendance",
  authMiddleware,
  companyAccessMiddleware,
  attendanceRoutes,
);
app.use("/api/v1/salary-structure", salaryStructureRoutes);
app.use("/api/v1/payroll", payrollRoutes);

// app.use("/api/v1/attendance",attendanceRoutes)
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
