import express, { Request, Response } from "express";
// import deparmentRoutes from "./routes/department.routes.js";
// import designationRoutes from "./routes/designation.routes.js";
// import employeeRoutes from "./routes/employee.routes.js";
// import attendanceRoutes from "./routes/attendance.routes.js";
import globalRoleRoutes from "./routes/globalRole.routes.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
// import companyRoutes from "./routes/company.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
// import salaryStructureRoutes from "./routes/salaryStructure.routes.js";
import authRoutes from "./routes/auth.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import leaveRoutes from "./routes/leave.route.js";
import salaryComponentRoutes from "./module/salaryComponent/salaryComponent.routes.js";
import employeeSalaryRoutes from "./module/employeeSalary/employeeSalary.routes.js";
import payrollRoutes from "./module/payRoll/payRoll.route.js";
import holidayRoutes from "./module/holiday/holiday.routes.js";
import weeklyOffRoutes from "./module/weeklyOff/weeklyOff.routes.js";
import companyRoutes from "./module/company/company.routes.js";
import employeeRoutes from "./module/employee/employee.routes.js";
import departmentRoutes from "./module/department/department.routes.js";
import designationRoutes from "./module/designation/designation.routes.js";
import shiftRoutes from "./module/shift/shift.routes.js";
import employeePersonalInfoRoutes from "./module/employeePersonalInfo/employeePersonalInfo.routes.js";
import employeeAddressRoutes from "./module/employeeAddress/employeeAddress.routes.js";
import employeeDocumentRoutes from "./module/employeeDocument/employeeDocument.routes.js";

import { verifyToken } from "./controllers/middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { companyAccessMiddleware } from "./middlewares/companyAccess.middleware.js";
import { employeeMiddleware } from "./middlewares/employee.middlewear.js";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://hrm-frontend-ashy.vercel.app"],
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
app.use("/api/v1/membership", membershipRoutes);
app.use("/api/v1/global-roles", globalRoleRoutes);
app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/companies", companyRoutes);

app.use("/api/v1/roles", authMiddleware, companyAccessMiddleware, roleRoutes);

// app.use("/api/v1/designations", designationRoutes);
// app.use("/api/v1/department", deparmentRoutes);
// app.use(
//   "/api/v1/employee",
//   authMiddleware,
//   companyAccessMiddleware,
//   employeeRoutes,
// );
app.use(
  "/api/v1/attendance",
  authMiddleware,
  companyAccessMiddleware,
  employeeMiddleware,
  attendanceRoutes,
);
app.use(
  "/api/v1/leave",
  authMiddleware,
  companyAccessMiddleware,
  employeeMiddleware,
  leaveRoutes,
);

app.use(
  "/api/v1/salary-component",
  authMiddleware,
  companyAccessMiddleware,
  salaryComponentRoutes,
);
app.use(
  "/api/v1/employee-salary",
  authMiddleware,
  companyAccessMiddleware,
  employeeSalaryRoutes,
);
app.use(
  "/api/v1/payroll",
  authMiddleware,
  companyAccessMiddleware,
  payrollRoutes,
);
app.use(
  "/api/v1/holiday",
  authMiddleware,
  companyAccessMiddleware,
  holidayRoutes,
);
app.use(
  "/api/v1/weekly-off",
  authMiddleware,
  companyAccessMiddleware,
  weeklyOffRoutes,
);
app.use(
  "/api/v1/company",
  authMiddleware,
  companyAccessMiddleware,
  companyRoutes,
);
app.use(
  "/api/v1/employee",
  authMiddleware,
  companyAccessMiddleware,
  employeeRoutes,
);
app.use(
  "/api/v1/employee-personal-info",
  authMiddleware,
  companyAccessMiddleware,
  employeePersonalInfoRoutes,
);
app.use(
  "/api/v1/employee-address",
  authMiddleware,
  companyAccessMiddleware,
  employeeAddressRoutes,
);
app.use(
  "/uploads",

  express.static("uploads"),
);

app.use(
  "/api/v1/employee-document",
  authMiddleware,
  companyAccessMiddleware,
  employeeDocumentRoutes,
);
app.use(
  "/api/v1/department",
  authMiddleware,
  companyAccessMiddleware,
  departmentRoutes,
);
app.use(
  "/api/v1/designation",
  authMiddleware,
  companyAccessMiddleware,
  designationRoutes,
);
app.use("/api/v1/shift", authMiddleware, companyAccessMiddleware, shiftRoutes);

// app.use("/api/v1/salary-structure", salaryStructureRoutes);
// app.use("/api/v1/payroll", payrollRoutes);

// app.use("/api/v1/attendance",attendanceRoutes)
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
