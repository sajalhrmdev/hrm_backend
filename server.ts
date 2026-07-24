import express, { Request, Response } from "express";
// import deparmentRoutes from "./routes/department.routes.js";
// import designationRoutes from "./routes/designation.routes.js";
// import employeeRoutes from "./routes/employee.routes.js";
// import attendanceRoutes from "./routes/attendance.routes.js";
import { loadSchemaContext } from "./module/chat/schemaLoader.js";
import globalRoleRoutes from "./routes/globalRole.routes.js";
import userRoutes from "./routes/user.routes.js";
import rolesRoutes from "./routes/role.routes.js";
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
import permissionRoutes from "./module/permission/permission.routes.js";
import roleRoutes from "./module/role/role.routes.js";
import rolePermissionRoutes from "./module/rolePermission/rolePermission.routes.js";
import payrollAdjustmentRoutes from "./module/payrollAdjustment/payrollAdjustment.routes.js";
import employeeBankDetailRoutes from "./module/employeeBankDetail/employeeBankDetail.routes.js";
import employeeEmergencyContactRoutes from "./module/employeeEmergencyContact/employeeEmergencyContact.routes.js";
import employeeExperianceRoutes from "./module/employeeExperience/employeeExperience.routes.js";
import attendanceRegularizationRoutes from "./module/attendanceRegularization/attendanceRegularization.routes.js";
import workScheduleRoutes from "./module/workSchedulePolicy/workSchedulePolicy.routes.js";
import leaveIncrementRoutes from "./module/processLeaveIncrement/processLeaveIncrement.route.js";
import leaveIncrementPolicyRoutes from "./module/leaveIncrementPolicy/leaveIncrementPolicy.routes.js";
import leaveIncrementLog from "./module/leaveIncrementLog/leaveIncrementLog.routes.js";
import noticeRoutes from "./module/notice/notice.route.js";
import userRoute from "./module/user/user.routes.js";
import superAdminRoutes from "./module/superAdmin/superAdmin.routes.js";
import officeLocationRoutes from "./module/officeLocation/officeLocation.routes.js";
import professionalTaxSlabRoutes from "./module/professionalTaxSlab/professionalTaxSlab.routes.js";
import employeeFaceRoutes from "./module/employeeFace/employeeFace.route.js";
import performanceReviewRoutes from "./module/performanceReview/performanceReview.route.js";
import rewardRoutes from "./module/reward/reward.route.js";
import chatRoutes from "./module/chat/chat.routes.js";
import emailSettingsRoutes from "./module/emailSettings/emailSettings.routes.js";
import emailTemplateRoutes from "./module/emailTemplate/emailTemplate.routes.js";
import resignationRoutes from "./module/resignation/resignation.routes.js";
import importRoutes from "./module/import/import.routes.js";
import documentTemplateRoutes from "./module/documentTemplate/documentTemplate.routes.js";
import documentRoutes from "./module/document/document.routes.js";

import { verifyToken } from "./controllers/middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { companyAccessMiddleware } from "./middlewares/companyAccess.middleware.js";
import { employeeMiddleware } from "./middlewares/employee.middlewear.js";
import { getCurrentUser } from "./controllers/auth.controller.js";
import { getMobileThemeByCompanySlug } from "./module/company/company.controller.js";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5001",
      "http://localhost:8081",
      "https://hrm-frontend-ashy.vercel.app",
      "https://2gvbh86w-3000.inc1.devtunnels.ms",
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
app.use("/api/v1/me", authMiddleware, companyAccessMiddleware, employeeMiddleware, getCurrentUser);
app.use("/api/v1/membership", membershipRoutes);
app.use("/api/v1/global-roles", globalRoleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/user", authMiddleware, companyAccessMiddleware, userRoute);
// app.use("/api/v1/companies", companyRoutes);

app.use("/api/v1/roles", authMiddleware, companyAccessMiddleware, rolesRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);

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

  attendanceRoutes,
);
app.use(
  "/api/v1/attendance",
  authMiddleware,
  companyAccessMiddleware,
  // employeeMiddleware,
  attendanceRegularizationRoutes,
);
app.use("/api/v1/employee-face", authMiddleware, employeeFaceRoutes);
app.use(
  "/api/v1/leave",
  authMiddleware,
  companyAccessMiddleware,
  // employeeMiddleware,
  leaveRoutes,
);
app.use(
  "/api/v1/leave",
  authMiddleware,
  companyAccessMiddleware,
  employeeMiddleware,
  leaveIncrementRoutes,
);
app.use(
  "/api/v1/leave-increment",
  authMiddleware,
  companyAccessMiddleware,
  employeeMiddleware,
  leaveIncrementPolicyRoutes,
);
app.use(
  "/api/v1/leave-increment-log",
  authMiddleware,
  companyAccessMiddleware,
  employeeMiddleware,
  leaveIncrementLog,
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
  "/api/v1/payroll-adjustment",
  authMiddleware,
  companyAccessMiddleware,
  payrollAdjustmentRoutes,
);
app.use(
  "/api/v1/professional-tax-slab",
  authMiddleware,
  companyAccessMiddleware,
  professionalTaxSlabRoutes,
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

  companyRoutes,
);
app.get("/api/v1/public/mobile-theme/:slug", getMobileThemeByCompanySlug);
app.use("/api/v1/office-location", officeLocationRoutes);
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
  "/api/v1/employee-bank-detail",
  authMiddleware,
  companyAccessMiddleware,
  employeeBankDetailRoutes,
);
app.use(
  "/api/v1/employee-emergency-contact",
  authMiddleware,
  companyAccessMiddleware,
  employeeEmergencyContactRoutes,
);
app.use(
  "/api/v1/employee-experience",
  authMiddleware,
  companyAccessMiddleware,
  employeeExperianceRoutes,
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
app.use(
  "/api/v1/work-schedule-policy",
  authMiddleware,
  companyAccessMiddleware,
  workScheduleRoutes,
);
app.use("/api/v1/permission", authMiddleware, permissionRoutes);
app.use("/api/v1/role", authMiddleware, companyAccessMiddleware, roleRoutes);
app.use(
  "/api/v1/role-permission",
  authMiddleware,
  companyAccessMiddleware,
  rolePermissionRoutes,
);
app.use(
  "/api/v1/notice",
  authMiddleware,
  companyAccessMiddleware,
  employeeMiddleware,
  noticeRoutes,
);
app.use(
  "/api/v1/performance",
  authMiddleware,
  companyAccessMiddleware,

  performanceReviewRoutes,
);
app.use(
  "/api/v1/rewards",
  authMiddleware,
  companyAccessMiddleware,

  rewardRoutes,
);
app.use(
  "/api/v1/chat",
  authMiddleware,
  companyAccessMiddleware,

  chatRoutes,
);
app.use(
  "/api/v1/email-settings",
  authMiddleware,
  companyAccessMiddleware,
  emailSettingsRoutes,
);
app.use(
  "/api/v1/email-template",
  authMiddleware,
  companyAccessMiddleware,
  emailTemplateRoutes,
);
app.use(
  "/api/v1/resignation",
  authMiddleware,
  companyAccessMiddleware,
  resignationRoutes,
);
app.use(
  "/api/v1/import",
  authMiddleware,
  companyAccessMiddleware,
  importRoutes,
);
app.use(
  "/api/v1/document-template",
  authMiddleware,
  companyAccessMiddleware,
  documentTemplateRoutes,
);
app.use(
  "/api/v1/document",
  authMiddleware,
  companyAccessMiddleware,
  documentRoutes,
);

// app.use("/api/v1/salary-structure", salaryStructureRoutes);
// app.use("/api/v1/payroll", payrollRoutes);

// app.use("/api/v1/attendance",attendanceRoutes)
// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });
async function bootstrap() {
  await loadSchemaContext();

  app.listen(port, () => {
    console.log(`Server Started`);
  });
}

bootstrap();
