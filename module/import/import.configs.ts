import { ImportConfig } from "./import.types.js";

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
        enumValues: ["EARNING", "DEDUCTION"],
      },
    ],
    uniqueCheck: [{ fields: ["code"], message: "Salary component code already exists" }],
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
      { header: "Amount", field: "amount", required: true, type: "number" },
    ],
    uniqueCheck: [{ fields: ["employeeId", "salaryComponentId"], message: "Salary component already assigned to this employee" }],
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
        enumValues: ["PRESENT", "ABSENT", "HALF_DAY", "WEEKLY_OFF", "HOLIDAY", "PAID_LEAVE", "UNPAID_LEAVE", "ON_DUTY", "WORK_FROM_HOME"],
      },
      { header: "Check In Time", field: "check_in_time", required: false, type: "date" },
      { header: "Check Out Time", field: "check_out_time", required: false, type: "date" },
      { header: "Total Work Minutes", field: "total_work_minutes", required: false, type: "number", defaultValue: 0 },
      { header: "Overtime Minutes", field: "overtime_minutes", required: false, type: "number", defaultValue: 0 },
      { header: "Late Minutes", field: "late_minutes", required: false, type: "number", defaultValue: 0 },
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
];

export function getImportConfig(entity: string): ImportConfig | undefined {
  return importConfigs.find((c) => c.entity === entity);
}

export function getAllImportConfigs(): ImportConfig[] {
  return importConfigs;
}
