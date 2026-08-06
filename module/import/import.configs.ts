import { ImportConfig } from "./import.types.js";
import { prisma } from "../../lib/prisma.js";

export const importConfigs: ImportConfig[] = [
  // ============================================
  // 1. ROLE
  // ============================================
  {
    entity: "role",
    label: "Role",
    model: "role",
    templateName: "Role Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["name"],
    requiresCompanyId: true,
    columns: [
      { header: "Name", field: "name", required: true, type: "string", unique: true },
      { header: "Description", field: "description", required: false, type: "string" },
    ],
    uniqueCheck: [{ fields: ["name"], message: "Role name already exists" }],
  },

  // ============================================
  // 2. DEPARTMENT
  // ============================================
  {
    entity: "department",
    label: "Department",
    model: "department",
    templateName: "Department Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["title"],
    requiresCompanyId: true,
    columns: [
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Status", field: "statusId", required: true, type: "number", defaultValue: 1 },
    ],
    uniqueCheck: [{ fields: ["title"], message: "Department already exists" }],
  },

  // ============================================
  // 3. DESIGNATION
  // ============================================
  {
    entity: "designation",
    label: "Designation",
    model: "designation",
    templateName: "Designation Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["title", "departmentId"],
    requiresCompanyId: true,
    columns: [
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Code", field: "code", required: false, type: "string" },
      { header: "Level", field: "level", required: false, type: "number" },
      {
        header: "Department",
        field: "departmentId",
        required: false,
        type: "lookup",
        lookup: { model: "department", key: "title", value: "id", scopeByCompany: true },
      },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["ACTIVE", "INACTIVE"],
        defaultValue: "ACTIVE",
      },
    ],
    uniqueCheck: [{ fields: ["title", "departmentId"], message: "Designation already exists in this department" }],
  },

  // ============================================
  // 4. SHIFT
  // ============================================
  {
    entity: "shift",
    label: "Shift",
    model: "shift",
    templateName: "Shift Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["title"],
    requiresCompanyId: true,
    columns: [
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Code", field: "code", required: false, type: "string" },
      { header: "Description", field: "description", required: false, type: "string" },
      { header: "Start Time", field: "startTime", required: true, type: "string" },
      { header: "End Time", field: "endTime", required: true, type: "string" },
      { header: "Break Minutes", field: "breakMinutes", required: false, type: "number", defaultValue: 0 },
      { header: "Grace Minutes", field: "graceMinutes", required: false, type: "number", defaultValue: 0 },
      { header: "Late After Minutes", field: "lateAfterMinutes", required: false, type: "number", defaultValue: 0 },
      { header: "Half Day After Minutes", field: "halfDayAfterMinutes", required: false, type: "number" },
      {
        header: "Enable Overtime",
        field: "enableOvertime",
        required: false,
        type: "boolean",
        defaultValue: false,
      },
      { header: "Overtime After Minutes", field: "overtimeAfterMinutes", required: false, type: "number", defaultValue: 0 },
      { header: "Minimum Work Minutes", field: "minimumWorkMinutes", required: false, type: "number" },
      {
        header: "Attendance Mode",
        field: "attendanceMode",
        required: false,
        type: "enum",
        enumValues: ["SINGLE", "MULTI"],
        defaultValue: "MULTI",
      },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["ACTIVE", "INACTIVE"],
        defaultValue: "ACTIVE",
      },
    ],
    uniqueCheck: [{ fields: ["title"], message: "Shift already exists" }],
  },

  // ============================================
  // 5. WORK SCHEDULE POLICY
  // ============================================
  {
    entity: "workSchedulePolicy",
    label: "Work Schedule Policy",
    model: "workSchedulePolicy",
    templateName: "Work Schedule Policy Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["title"],
    requiresCompanyId: true,
    columns: [
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Description", field: "description", required: false, type: "string" },
      {
        header: "Attendance Type",
        field: "attendanceType",
        required: false,
        type: "enum",
        enumValues: ["FIXED", "FLEXIBLE"],
        defaultValue: "FIXED",
      },
      {
        header: "Attendance From",
        field: "attendanceFrom",
        required: false,
        type: "enum",
        enumValues: ["OFFICE", "REMOTE"],
        defaultValue: "OFFICE",
      },
      { header: "Required Work Minutes", field: "requiredWorkMinutes", required: false, type: "number" },
      { header: "Half Day Minutes", field: "halfDayMinutes", required: false, type: "number" },
      { header: "Enable Overtime", field: "enableOvertime", required: false, type: "boolean", defaultValue: false },
      { header: "Overtime After Minutes", field: "overtimeAfterMinutes", required: false, type: "number" },
      {
        header: "Shift",
        field: "shiftId",
        required: false,
        type: "lookup",
        lookup: { model: "shift", key: "title", value: "id", scopeByCompany: true },
      },
      { header: "Is Active", field: "isActive", required: false, type: "boolean", defaultValue: true },
    ],
    uniqueCheck: [{ fields: ["title"], message: "Work schedule policy already exists" }],
  },

  // ============================================
  // 6. LEAVE TYPE
  // ============================================
  {
    entity: "leaveType",
    label: "Leave Type",
    model: "leaveType",
    templateName: "Leave Type Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["code"],
    requiresCompanyId: true,
    columns: [
      { header: "Name", field: "name", required: true, type: "string" },
      { header: "Code", field: "code", required: true, type: "string" },
      { header: "Is Paid", field: "is_paid", required: false, type: "boolean", defaultValue: true },
      { header: "Is Active", field: "is_active", required: false, type: "boolean", defaultValue: true },
      { header: "Carry Forward", field: "carryForward", required: false, type: "boolean", defaultValue: false },
      { header: "Max Days", field: "maxDays", required: false, type: "number" },
    ],
    uniqueCheck: [{ fields: ["code"], message: "Leave type code already exists" }],
  },

  // ============================================
  // 7. SALARY COMPONENT
  // ============================================
  {
    entity: "salaryComponent",
    label: "Salary Component",
    model: "salaryComponent",
    templateName: "Salary Component Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["code"],
    requiresCompanyId: true,
    columns: [
      { header: "Name", field: "name", required: true, type: "string" },
      { header: "Code", field: "code", required: true, type: "string" },
      {
        header: "Type",
        field: "type",
        required: true,
        type: "enum",
        enumValues: ["EARNING", "DEDUCTION", "EMPLOYER_CONTRIBUTION"],
      },
      {
        header: "Calculation Type",
        field: "calculationType",
        required: false,
        type: "enum",
        enumValues: ["FIXED", "PERCENTAGE"],
        defaultValue: "FIXED",
      },
      {
        header: "Base Type",
        field: "baseType",
        required: false,
        type: "enum",
        enumValues: ["COMPONENT", "COMPONENTS", "GROSS"],
      },
      {
        header: "Base Component",
        field: "baseComponentId",
        required: false,
        type: "lookup",
        lookup: { model: "salaryComponent", key: "code", value: "id", scopeByCompany: true },
      },
      { header: "Percentage Value", field: "percentageValue", required: false, type: "number" },
      { header: "Cap Amount", field: "capAmount", required: false, type: "number" },
      { header: "Floor Amount", field: "floorAmount", required: false, type: "number" },
      { header: "Base Cap Amount", field: "baseCapAmount", required: false, type: "number" },
    ],
    uniqueCheck: [{ fields: ["code"], message: "Salary component code already exists" }],
    rowValidator: salaryComponentRowValidator,
  },

  // ============================================
  // 8. HOLIDAY
  // ============================================
  {
    entity: "holiday",
    label: "Holiday",
    model: "holiday",
    templateName: "Holiday Import",
    duplicateStrategy: "skip",
    dedupeKey: ["title", "date"],
    requiresCompanyId: true,
    columns: [
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Date", field: "date", required: true, type: "date" },
      {
        header: "Type",
        field: "type",
        required: true,
        type: "enum",
        enumValues: ["NATIONAL", "FESTIVAL", "COMPANY", "OPTIONAL"],
      },
      { header: "Is Paid", field: "isPaid", required: false, type: "boolean", defaultValue: true },
      { header: "Description", field: "description", required: false, type: "string" },
    ],
    uniqueCheck: [],
  },

  // ============================================
  // 9. OFFICE LOCATION
  // ============================================
  {
    entity: "officeLocation",
    label: "Office Location",
    model: "officeLocation",
    templateName: "Office Location Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["name"],
    requiresCompanyId: true,
    columns: [
      { header: "Name", field: "name", required: true, type: "string" },
      { header: "Address", field: "address", required: false, type: "string" },
      { header: "City", field: "city", required: false, type: "string" },
      { header: "State", field: "state", required: false, type: "string" },
      { header: "Country", field: "country", required: false, type: "string" },
      { header: "Pin Code", field: "pinCode", required: false, type: "string" },
      { header: "Latitude", field: "latitude", required: false, type: "number" },
      { header: "Longitude", field: "longitude", required: false, type: "number" },
      { header: "Radius", field: "radius", required: false, type: "number", defaultValue: 100 },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["ACTIVE", "INACTIVE"],
        defaultValue: "ACTIVE",
      },
    ],
    uniqueCheck: [{ fields: ["name"], message: "Office location already exists" }],
  },

  // ============================================
  // 10. EMPLOYEE
  // ============================================
  {
    entity: "employee",
    label: "Employee",
    model: "employee",
    templateName: "Employee Import",
    duplicateStrategy: "skip",
    dedupeKey: ["email"],
    requiresCompanyId: true,
    columns: [
      { header: "Name", field: "name", required: true, type: "string" },
      { header: "Email", field: "email", required: true, type: "string", unique: true },
      { header: "Phone", field: "phone", required: true, type: "string" },
      { header: "Employee Code", field: "employeeCode", required: false, type: "string" },
      {
        header: "Department",
        field: "departmentId",
        required: false,
        type: "lookup",
        lookup: { model: "department", key: "title", value: "id", scopeByCompany: true },
      },
      {
        header: "Designation",
        field: "designationId",
        required: false,
        type: "lookup",
        lookup: { model: "designation", key: "title", value: "id", scopeByCompany: true },
      },
      {
        header: "Role",
        field: "roleId",
        required: false,
        type: "lookup",
        lookup: { model: "role", key: "name", value: "id", scopeByCompany: true },
      },
      {
        header: "Shift",
        field: "shiftId",
        required: false,
        type: "lookup",
        lookup: { model: "shift", key: "title", value: "id", scopeByCompany: true },
      },
      {
        header: "Work Schedule",
        field: "workSchedulePolicyId",
        required: false,
        type: "lookup",
        lookup: { model: "workSchedulePolicy", key: "title", value: "id", scopeByCompany: true },
      },
      { header: "Joining Date", field: "joiningDate", required: false, type: "date" },
      { header: "PF Number", field: "pfNumber", required: false, type: "string" },
      { header: "ESIC Number", field: "esiNumber", required: false, type: "string" },
      { header: "UAN", field: "uan", required: false, type: "string" },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        defaultValue: "ACTIVE",
      },
    ],
    uniqueCheck: [{ fields: ["email"], message: "Employee email already exists" }],
  },

  // ============================================
  // 11. EMPLOYEE PERSONAL INFO
  // ============================================
  {
    entity: "employeePersonalInfo",
    label: "Employee Personal Info",
    model: "employeePersonalInfo",
    templateName: "Employee Personal Info Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId"],
    requiresCompanyId: false,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Date of Birth", field: "dob", required: false, type: "date" },
      { header: "Gender", field: "gender", required: false, type: "string" },
      { header: "Blood Group", field: "bloodGroup", required: false, type: "string" },
      { header: "Marital Status", field: "maritalStatus", required: false, type: "string" },
      { header: "Father Name", field: "fatherName", required: false, type: "string" },
      { header: "Mother Name", field: "motherName", required: false, type: "string" },
      { header: "Nationality", field: "nationality", required: false, type: "string" },
      { header: "Religion", field: "religion", required: false, type: "string" },
    ],
    uniqueCheck: [{ fields: ["employeeId"], message: "Personal info already exists for this employee" }],
  },

  // ============================================
  // 12. EMPLOYEE ADDRESS
  // ============================================
  {
    entity: "employeeAddress",
    label: "Employee Address",
    model: "employeeAddress",
    templateName: "Employee Address Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId"],
    requiresCompanyId: false,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Present Address", field: "presentAddress", required: false, type: "string" },
      { header: "Permanent Address", field: "permanentAddress", required: false, type: "string" },
      { header: "City", field: "city", required: false, type: "string" },
      { header: "State", field: "state", required: false, type: "string" },
      { header: "Country", field: "country", required: false, type: "string" },
      { header: "Pin Code", field: "pinCode", required: false, type: "string" },
    ],
    uniqueCheck: [{ fields: ["employeeId"], message: "Address already exists for this employee" }],
  },

  // ============================================
  // 13. EMPLOYEE BANK DETAIL
  // ============================================
  {
    entity: "employeeBankDetail",
    label: "Employee Bank Detail",
    model: "employeeBankDetail",
    templateName: "Employee Bank Detail Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Bank Name", field: "bankName", required: false, type: "string" },
      { header: "Account Holder Name", field: "accountHolderName", required: false, type: "string" },
      { header: "Account Number", field: "accountNumber", required: false, type: "string" },
      { header: "IFSC Code", field: "ifscCode", required: false, type: "string" },
      { header: "Branch Name", field: "branchName", required: false, type: "string" },
      { header: "UPI ID", field: "upiId", required: false, type: "string" },
    ],
    uniqueCheck: [{ fields: ["employeeId"], message: "Bank detail already exists for this employee" }],
  },

  // ============================================
  // 14. EMPLOYEE EMERGENCY CONTACT
  // ============================================
  {
    entity: "employeeEmergencyContact",
    label: "Employee Emergency Contact",
    model: "employeeEmergencyContact",
    templateName: "Employee Emergency Contact Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Contact Name", field: "contactName", required: false, type: "string" },
      { header: "Relationship", field: "relationship", required: false, type: "string" },
      { header: "Phone", field: "phone", required: false, type: "string" },
      { header: "Alternate Phone", field: "alternatePhone", required: false, type: "string" },
      { header: "Email", field: "email", required: false, type: "string" },
      { header: "Address", field: "address", required: false, type: "string" },
    ],
    uniqueCheck: [{ fields: ["employeeId"], message: "Emergency contact already exists for this employee" }],
  },

  // ============================================
  // 15. EMPLOYEE SALARY COMPONENT
  // ============================================
  {
    entity: "employeeSalaryComponent",
    label: "Employee Salary Component",
    model: "employeeSalaryComponent",
    templateName: "Employee Salary Component Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId", "salaryComponentId"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      {
        header: "Salary Component Code",
        field: "salaryComponentId",
        required: true,
        type: "lookup",
        lookup: { model: "salaryComponent", key: "code", value: "id", scopeByCompany: true },
      },
      { header: "Amount", field: "amount", required: false, type: "number" },
      {
        header: "Calculation Type",
        field: "calculationType",
        required: false,
        type: "enum",
        enumValues: ["FIXED", "PERCENTAGE"],
      },
      {
        header: "Base Type",
        field: "baseType",
        required: false,
        type: "enum",
        enumValues: ["COMPONENT", "COMPONENTS", "GROSS"],
      },
      {
        header: "Base Component",
        field: "baseComponentId",
        required: false,
        type: "lookup",
        lookup: { model: "salaryComponent", key: "code", value: "id", scopeByCompany: true },
      },
      { header: "Percentage Value", field: "percentageValue", required: false, type: "number" },
      { header: "Cap Amount", field: "capAmount", required: false, type: "number" },
      { header: "Floor Amount", field: "floorAmount", required: false, type: "number" },
      { header: "Base Cap Amount", field: "baseCapAmount", required: false, type: "number" },
    ],
    uniqueCheck: [{ fields: ["employeeId", "salaryComponentId"], message: "Salary component already assigned to this employee" }],
    rowValidator: employeeSalaryComponentRowValidator,
  },

  // ============================================
  // 16. LEAVE BALANCE
  // ============================================
  {
    entity: "leaveBalance",
    label: "Leave Balance",
    model: "leaveBalance",
    templateName: "Leave Balance Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId", "leaveTypeId", "year"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      {
        header: "Leave Type Code",
        field: "leaveTypeId",
        required: true,
        type: "lookup",
        lookup: { model: "leaveType", key: "code", value: "id", scopeByCompany: true },
      },
      { header: "Year", field: "year", required: true, type: "number" },
      { header: "Total Allocated", field: "total_allocated", required: true, type: "number" },
    ],
    uniqueCheck: [{ fields: ["employeeId", "leaveTypeId", "year"], message: "Leave balance already exists" }],
  },

  // ============================================
  // 17. ATTENDANCE
  // ============================================
  {
    entity: "attendance",
    label: "Attendance",
    model: "attendance",
    templateName: "Attendance Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId", "date"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Date", field: "date", required: true, type: "date" },
      {
        header: "Status",
        field: "status",
        required: true,
        type: "enum",
        enumValues: ["PRESENT", "ABSENT", "HALF_DAY", "HALF_DAY_LEAVE", "WEEKLY_OFF", "HOLIDAY", "PAID_LEAVE", "UNPAID_LEAVE", "ON_DUTY", "WORK_FROM_HOME"],
      },
      { header: "Check In Time", field: "check_in_time", required: false, type: "date" },
      { header: "Check Out Time", field: "check_out_time", required: false, type: "date" },
      { header: "Total Work Minutes", field: "total_work_minutes", required: false, type: "number", defaultValue: 0 },
      { header: "Overtime Minutes", field: "overtime_minutes", required: false, type: "number", defaultValue: 0 },
      { header: "Late Minutes", field: "late_minutes", required: false, type: "number", defaultValue: 0 },
      {
        header: "Shift",
        field: "shiftId",
        required: false,
        type: "lookup",
        lookup: { model: "shift", key: "title", value: "id", scopeByCompany: true },
      },
    ],
    uniqueCheck: [{ fields: ["employeeId", "date"], message: "Attendance already exists for this date" }],
  },

  // ============================================
  // 18. PERFORMANCE REVIEW
  // ============================================
  {
    entity: "performanceReview",
    label: "Performance Review",
    model: "performanceReview",
    templateName: "Performance Review Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["employeeId", "reviewMonth", "reviewYear"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Punctuality", field: "punctuality", required: true, type: "number" },
      { header: "Teamwork", field: "teamwork", required: true, type: "number" },
      { header: "Productivity", field: "productivity", required: true, type: "number" },
      { header: "Overall Rating", field: "overallRating", required: true, type: "number" },
      { header: "Comments", field: "comments", required: false, type: "string" },
      { header: "Review Month", field: "reviewMonth", required: true, type: "number" },
      { header: "Review Year", field: "reviewYear", required: true, type: "number" },
    ],
    uniqueCheck: [{ fields: ["employeeId", "reviewMonth", "reviewYear"], message: "Review already exists for this month/year" }],
  },

  // ============================================
  // 19. EMPLOYEE EXPERIENCE
  // ============================================
  {
    entity: "employeeExperience",
    label: "Employee Experience",
    model: "employeeExperience",
    templateName: "Employee Experience Import",
    duplicateStrategy: "skip",
    dedupeKey: ["employeeId", "companyName"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Company Name", field: "companyName", required: true, type: "string" },
      { header: "Designation", field: "designation", required: true, type: "string" },
      { header: "Start Date", field: "startDate", required: true, type: "date" },
      { header: "End Date", field: "endDate", required: false, type: "date" },
      { header: "Currently Working", field: "currentlyWorking", required: false, type: "boolean", defaultValue: false },
      { header: "Skills", field: "skills", required: false, type: "string" },
      { header: "Responsibilities", field: "responsibilities", required: false, type: "string" },
      { header: "Document URL", field: "documentUrl", required: false, type: "string" },
    ],
    uniqueCheck: [{ fields: ["employeeId", "companyName"], message: "Experience for this company already exists" }],
  },

  // ============================================
  // 20. LEAVE APPLICATION
  // ============================================
  {
    entity: "leaveApplication",
    label: "Leave Application",
    model: "leaveApplication",
    templateName: "Leave Application Import",
    duplicateStrategy: "skip",
    dedupeKey: ["employeeId", "fromDate"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      {
        header: "Leave Type Code",
        field: "leaveTypeId",
        required: true,
        type: "lookup",
        lookup: { model: "leaveType", key: "code", value: "id", scopeByCompany: true },
      },
      { header: "From Date", field: "fromDate", required: true, type: "date" },
      { header: "To Date", field: "toDate", required: true, type: "date" },
      { header: "Total Days", field: "totalDays", required: true, type: "number" },
      { header: "Leave Mode", field: "leaveMode", required: false, type: "string" },
      { header: "Paid Days", field: "paidDays", required: false, type: "number", defaultValue: 0 },
      { header: "Unpaid Days", field: "unpaidDays", required: false, type: "number", defaultValue: 0 },
      { header: "Reason", field: "reason", required: false, type: "string" },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["PENDING", "APPROVED", "REJECTED"],
        defaultValue: "APPROVED",
      },
    ],
    uniqueCheck: [{ fields: ["employeeId", "fromDate"], message: "Leave application already exists for this date" }],
  },

  // ============================================
  // 21. LEAVE INCREMENT POLICY
  // ============================================
  {
    entity: "leaveIncrementPolicy",
    label: "Leave Increment Policy",
    model: "leaveIncrementPolicy",
    templateName: "Leave Increment Policy Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["leaveTypeId", "frequency"],
    requiresCompanyId: true,
    columns: [
      {
        header: "Leave Type Code",
        field: "leaveTypeId",
        required: true,
        type: "lookup",
        lookup: { model: "leaveType", key: "code", value: "id", scopeByCompany: true },
      },
      { header: "Title", field: "title", required: false, type: "string" },
      { header: "Increment Amount", field: "incrementAmount", required: true, type: "number" },
      {
        header: "Frequency",
        field: "frequency",
        required: true,
        type: "enum",
        enumValues: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
      },
      { header: "Is Active", field: "isActive", required: false, type: "boolean", defaultValue: true },
      { header: "Max Limit", field: "maxLimit", required: false, type: "number" },
      { header: "Effective From", field: "effectiveFrom", required: false, type: "date" },
      { header: "Effective To", field: "effectiveTo", required: false, type: "date" },
    ],
    uniqueCheck: [{ fields: ["leaveTypeId", "frequency"], message: "Leave increment policy already exists for this leave type and frequency" }],
  },

  // ============================================
  // 22. WEEKLY OFF CONFIG
  // ============================================
  {
    entity: "weeklyOffConfig",
    label: "Weekly Off Config",
    model: "weeklyOffConfig",
    templateName: "Weekly Off Config Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["dayOfWeek", "weekNumber"],
    requiresCompanyId: true,
    columns: [
      { header: "Day of Week", field: "dayOfWeek", required: true, type: "number" },
      { header: "Week Number", field: "weekNumber", required: false, type: "number" },
      { header: "Is Active", field: "isActive", required: false, type: "boolean", defaultValue: true },
    ],
    uniqueCheck: [{ fields: ["dayOfWeek", "weekNumber"], message: "Weekly off config already exists for this day" }],
  },

  // ============================================
  // 23. NOTICE
  // ============================================
  {
    entity: "notice",
    label: "Notice",
    model: "notice",
    templateName: "Notice Import",
    duplicateStrategy: "skip",
    dedupeKey: ["title", "noticeDate"],
    requiresCompanyId: true,
    columns: [
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Description", field: "description", required: true, type: "string" },
      { header: "Notice Date", field: "noticeDate", required: true, type: "date" },
      { header: "Expiry Date", field: "expiryDate", required: false, type: "date" },
      {
        header: "Priority",
        field: "priority",
        required: false,
        type: "enum",
        enumValues: ["LOW", "NORMAL", "HIGH", "URGENT"],
        defaultValue: "NORMAL",
      },
      { header: "Is Published", field: "isPublished", required: false, type: "boolean", defaultValue: true },
      { header: "Attachment URL", field: "attachmentUrl", required: false, type: "string" },
    ],
    uniqueCheck: [],
  },

  // ============================================
  // 24. EMPLOYEE REWARD
  // ============================================
  {
    entity: "employeeReward",
    label: "Employee Reward",
    model: "employeeReward",
    templateName: "Employee Reward Import",
    duplicateStrategy: "skip",
    dedupeKey: ["employeeId", "title", "rewardDate"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Description", field: "description", required: false, type: "string" },
      { header: "Reward Type", field: "rewardType", required: true, type: "string" },
      { header: "Reward Amount", field: "rewardAmount", required: false, type: "number" },
      { header: "Reward Date", field: "rewardDate", required: true, type: "date" },
    ],
    uniqueCheck: [{ fields: ["employeeId", "title", "rewardDate"], message: "Reward already exists" }],
  },

  // ============================================
  // 25. PROFESSIONAL TAX SLAB
  // ============================================
  {
    entity: "professionalTaxSlab",
    label: "Professional Tax Slab",
    model: "professionalTaxSlab",
    templateName: "Professional Tax Slab Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["minSalary"],
    requiresCompanyId: true,
    columns: [
      { header: "Min Salary", field: "minSalary", required: true, type: "number" },
      { header: "Max Salary", field: "maxSalary", required: false, type: "number" },
      { header: "Tax Amount", field: "taxAmount", required: false, type: "number", defaultValue: 0 },
    ],
    uniqueCheck: [{ fields: ["minSalary"], message: "Professional tax slab already exists for this salary range" }],
  },

  // ============================================
  // 26. EMPLOYEE DOCUMENT
  // ============================================
  {
    entity: "employeeDocument",
    label: "Employee Document",
    model: "employeeDocument",
    templateName: "Employee Document Import",
    duplicateStrategy: "skip",
    dedupeKey: ["employeeId", "title"],
    requiresCompanyId: false,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Title", field: "title", required: true, type: "string" },
      { header: "Document Type", field: "documentType", required: true, type: "string" },
      { header: "Document Number", field: "documentNumber", required: false, type: "string" },
      { header: "File URL", field: "fileUrl", required: true, type: "string" },
      { header: "File Name", field: "fileName", required: false, type: "string" },
      { header: "MIME Type", field: "mimeType", required: false, type: "string" },
      { header: "File Size", field: "fileSize", required: false, type: "number" },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["ACTIVE", "INACTIVE"],
        defaultValue: "ACTIVE",
      },
    ],
    uniqueCheck: [{ fields: ["employeeId", "title"], message: "Document with this title already exists" }],
  },

  // ============================================
  // 27. RESIGNATION
  // ============================================
  {
    entity: "resignation",
    label: "Resignation",
    model: "resignation",
    templateName: "Resignation Import",
    duplicateStrategy: "skip",
    dedupeKey: ["employeeId"],
    requiresCompanyId: true,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      { header: "Resignation Date", field: "resignationDate", required: true, type: "date" },
      { header: "Last Working Day", field: "lastWorkingDay", required: true, type: "date" },
      { header: "Notice Period Days", field: "noticePeriodDays", required: false, type: "number", defaultValue: 30 },
      { header: "Reason", field: "reason", required: false, type: "string" },
      { header: "Handover To", field: "handoverTo", required: false, type: "string" },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
        defaultValue: "APPROVED",
      },
    ],
    uniqueCheck: [{ fields: ["employeeId"], message: "Resignation already exists for this employee" }],
  },

  // ============================================
  // 28. PAYROLL RUN
  // ============================================
  {
    entity: "payRollRun",
    label: "Payroll Run",
    model: "payRollRun",
    templateName: "Payroll Run Import",
    duplicateStrategy: "upsert",
    dedupeKey: ["periodStart"],
    requiresCompanyId: true,
    columns: [
      { header: "Title", field: "title", required: false, type: "string" },
      { header: "Period Start", field: "periodStart", required: true, type: "date" },
      { header: "Period End", field: "periodEnd", required: true, type: "date" },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["DRAFT", "FINALIZED"],
        defaultValue: "DRAFT",
      },
    ],
    uniqueCheck: [{ fields: ["periodStart"], message: "Payroll run already exists for this period" }],
  },

  // ============================================
  // 29. PAYROLL
  // ============================================
  {
    entity: "payRoll",
    label: "Payroll",
    model: "payRoll",
    templateName: "Payroll Import",
    duplicateStrategy: "skip",
    dedupeKey: ["employeeId", "payroll_run_id"],
    requiresCompanyId: false,
    employeeRef: "employeeEmail",
    columns: [
      { header: "Employee Email", field: "employeeEmail", required: true, type: "string" },
      {
        header: "Payroll Run Period Start",
        field: "payroll_run_id",
        required: true,
        type: "lookup",
        lookup: { model: "payRollRun", key: "periodStart", value: "id", scopeByCompany: true },
      },
      { header: "Total Days", field: "total_days", required: true, type: "number" },
      { header: "Present Days", field: "present_days", required: true, type: "number" },
      { header: "Paid Leave Days", field: "paid_leave_days", required: false, type: "number", defaultValue: 0 },
      { header: "LOP Days", field: "lop_days", required: false, type: "number", defaultValue: 0 },
      { header: "Payable Days", field: "payable_days", required: true, type: "number" },
      { header: "Gross Salary", field: "gross_salary", required: true, type: "number" },
      { header: "Overtime Amount", field: "overtime_amount", required: false, type: "number", defaultValue: 0 },
      { header: "Total Deduction", field: "total_deduction", required: true, type: "number" },
      { header: "Net Salary", field: "net_salary", required: true, type: "number" },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["DRAFT", "FINALIZED", "PAID"],
        defaultValue: "DRAFT",
      },
    ],
    uniqueCheck: [{ fields: ["employeeId", "payroll_run_id"], message: "Payroll already exists for this employee in this run" }],
  },

  // ============================================
  // 30. PAYROLL SNAP COMPONENT
  // ============================================
  {
    entity: "payrollSnapComponent",
    label: "Payroll Snap Component",
    model: "payrollSnapComponent",
    templateName: "Payroll Snap Component Import",
    duplicateStrategy: "skip",
    dedupeKey: ["payrollId", "componentCode"],
    requiresCompanyId: false,
    columns: [
      {
        header: "Payroll ID",
        field: "payrollId",
        required: true,
        type: "number",
      },
      { header: "Component Name", field: "componentName", required: true, type: "string" },
      { header: "Component Code", field: "componentCode", required: true, type: "string" },
      {
        header: "Type",
        field: "type",
        required: true,
        type: "enum",
        enumValues: ["EARNING", "DEDUCTION", "EMPLOYER_CONTRIBUTION"],
      },
      { header: "Standard Amount", field: "standardAmount", required: true, type: "number" },
      { header: "Amount", field: "amount", required: true, type: "number" },
    ],
    uniqueCheck: [{ fields: ["payrollId", "componentCode"], message: "Component already exists for this payroll" }],
  },

  // ============================================
  // 31. SALARY HISTORY (COMPOSITE)
  // ============================================
  {
    entity: "salaryHistory",
    label: "Salary History",
    model: "salaryHistory",
    templateName: "Salary History Import",
    duplicateStrategy: "skip",
    dedupeKey: ["employeeId", "month", "year"],
    requiresCompanyId: true,
    isComposite: true,
    employeeRef: "employeeCode",
    instructions:
      "Resolve each employee by EMPLOYEE CODE (or Employee Email as fallback).\n" +
      "After the fixed columns (Month, Year, Net Salary, etc.), add columns for each salary component.\n" +
      "For each component, use TWO columns:\n" +
      "  \"ComponentName Standard\" - the standard amount (e.g. Basic Standard)\n" +
      "  \"ComponentName\" - the actual amount (e.g. Basic)\n" +
      "If only the actual column is provided, it applies to both.\n" +
      "The column header must match the Salary Component Name exactly (e.g. Basic, HRA, DA, TA, PF, ESI).\n" +
      "The system will auto-match columns to your Salary Components table. Unmatched columns default to EARNING type (DEDUCTION inferred for PF/ESI/Tax/Advance names).\n\n" +
      "Example columns:\n" +
      "Employee Code, Month, Year, Total Days, Present Days, Paid Leave Days, LOP Days, Payable Days, Gross Salary, Total Deduction, Net Salary, Status, Basic Standard, Basic, HRA Standard, HRA, PF Standard, PF",
    columns: [
      { header: "Employee Code", field: "employeeCode", required: true, type: "string" },
      { header: "Month", field: "month", required: true, type: "number" },
      { header: "Year", field: "year", required: true, type: "number" },
      { header: "Total Days", field: "totalDays", required: false, type: "number", defaultValue: 0 },
      { header: "Present Days", field: "presentDays", required: false, type: "number", defaultValue: 0 },
      { header: "Paid Leave Days", field: "paidLeaveDays", required: false, type: "number", defaultValue: 0 },
      { header: "LOP Days", field: "lopDays", required: false, type: "number", defaultValue: 0 },
      { header: "Payable Days", field: "payableDays", required: false, type: "number", defaultValue: 0 },
      { header: "Gross Salary", field: "grossSalary", required: true, type: "number" },
      { header: "Total Deduction", field: "totalDeduction", required: true, type: "number" },
      { header: "Net Salary", field: "netSalary", required: true, type: "number" },
      {
        header: "Status",
        field: "status",
        required: false,
        type: "enum",
        enumValues: ["DRAFT", "FINALIZED", "PAID"],
        defaultValue: "FINALIZED",
      },
    ],
    uniqueCheck: [{ fields: ["employeeId", "month", "year"], message: "Salary record already exists for this employee in this month" }],
  },
];

// ============================================
// SALARY COMPONENT ROW VALIDATOR
// ============================================

async function salaryComponentRowValidator(
  data: Record<string, any>,
  companyId: number
): Promise<any[]> {
  const errors: any[] = [];

  const calculationType = data.calculationType ?? "FIXED";
  const capAmount = data.capAmount ?? null;
  const floorAmount = data.floorAmount ?? null;
  const baseCapAmount = data.baseCapAmount ?? null;

  if (
    capAmount != null &&
    floorAmount != null &&
    capAmount < floorAmount
  ) {
    errors.push({
      row: 0,
      field: "Cap Amount",
      message: "Cap amount cannot be lower than floor amount",
    });
  }

  if (baseCapAmount != null && baseCapAmount < 0) {
    errors.push({
      row: 0,
      field: "Base Cap Amount",
      message: "Base cap amount cannot be negative",
    });
  }

  if (calculationType === "PERCENTAGE") {
    const baseType = data.baseType ?? null;

    if (!baseType) {
      errors.push({
        row: 0,
        field: "Base Type",
        message:
          "Percentage component requires a base type (COMPONENT, COMPONENTS or GROSS)",
      });
    } else if (baseType === "COMPONENT") {
      if (!data.baseComponentId) {
        errors.push({
          row: 0,
          field: "Base Component",
          message: "Percentage component requires a base component",
        });
      } else {
        const base = await prisma.salaryComponent.findFirst({
          where: { id: data.baseComponentId, companyId },
          select: { code: true },
        });

        if (!base) {
          errors.push({
            row: 0,
            field: "Base Component",
            message: "Base component not found in this company",
          });
        } else if (
          String(base.code).toLowerCase().trim() ===
          String(data.code ?? "").toLowerCase().trim()
        ) {
          errors.push({
            row: 0,
            field: "Base Component",
            message: "Component cannot be based on itself",
          });
        }
      }
    } else if (baseType === "COMPONENTS") {
      const ids = Array.isArray(data.baseComponentIds)
        ? data.baseComponentIds.map((n: any) => Number(n)).filter((n: any) => !Number.isNaN(n))
        : [];

      if (!ids.length) {
        errors.push({
          row: 0,
          field: "Base Components",
          message: "Percentage component requires at least one base component",
        });
      } else {
        const uniqueIds = [...new Set(ids)];
        const found = await prisma.salaryComponent.findMany({
          where: { id: { in: uniqueIds }, companyId },
          select: { code: true },
        });

        if (found.length !== uniqueIds.length) {
          errors.push({
            row: 0,
            field: "Base Components",
            message: "Base component not found in this company",
          });
        }

        if (
          found.some(
            (b) =>
              String(b.code).toLowerCase().trim() ===
              String(data.code ?? "").toLowerCase().trim(),
          )
        ) {
          errors.push({
            row: 0,
            field: "Base Components",
            message: "Component cannot be based on itself",
          });
        }
      }
    }

    const percentageValue = data.percentageValue ?? null;

    if (percentageValue == null || percentageValue <= 0) {
      errors.push({
        row: 0,
        field: "Percentage Value",
        message: "Percentage value must be greater than 0",
      });
    }
  }

  return errors;
};

// ============================================
// EMPLOYEE SALARY COMPONENT ROW VALIDATOR
// ============================================

async function employeeSalaryComponentRowValidator(
  data: Record<string, any>,
  companyId: number
): Promise<any[]> {
  const errors: any[] = [];

  const component = await prisma.salaryComponent.findFirst({
    where: { id: data.salaryComponentId, companyId },
  });

  if (!component) {
    errors.push({
      row: 0,
      field: "Salary Component Code",
      message: "Salary component not found in this company",
    });

    return errors;
  }

  const calculationType =
    data.calculationType ?? component.calculationType ?? "FIXED";
  const capAmount = data.capAmount ?? component.capAmount ?? null;
  const floorAmount = data.floorAmount ?? component.floorAmount ?? null;

  if (
    capAmount != null &&
    floorAmount != null &&
    capAmount < floorAmount
  ) {
    errors.push({
      row: 0,
      field: "Cap Amount",
      message: "Cap amount cannot be lower than floor amount",
    });
  }

  if (calculationType === "PERCENTAGE") {
    const baseType = data.baseType ?? component.baseType ?? null;

    if (!baseType) {
      errors.push({
        row: 0,
        field: "Base Type",
        message: `Percentage component ${component.name} requires a base type (COMPONENT or GROSS)`,
      });
    }

    const percentageValue =
      data.percentageValue ?? component.percentageValue ?? null;

    if (percentageValue == null || percentageValue <= 0) {
      errors.push({
        row: 0,
        field: "Percentage Value",
        message: `Percentage value must be greater than 0 for ${component.name}`,
      });
    }
  } else if (data.amount == null) {
    errors.push({
      row: 0,
      field: "Amount",
      message: `Amount is required for ${component.name}`,
    });
  }

  return errors;
};

export function getImportConfig(entity: string): ImportConfig | undefined {
  return importConfigs.find((c) => c.entity === entity);
}

export function getAllImportConfigs(): ImportConfig[] {
  return importConfigs;
}
