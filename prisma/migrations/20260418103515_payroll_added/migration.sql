-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateTable
CREATE TABLE "SalaryStracture" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "monthly_salary" DOUBLE PRECISION NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryStracture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayRoll" (
    "id" SERIAL NOT NULL,
    "payroll_run_id" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "total_days" INTEGER NOT NULL,
    "present_days" INTEGER NOT NULL,
    "paid_leave_days" INTEGER NOT NULL,
    "lop_days" INTEGER NOT NULL,
    "payble_days" INTEGER NOT NULL,
    "gross_salary" DOUBLE PRECISION NOT NULL,
    "base_salary" DOUBLE PRECISION NOT NULL,
    "deduction" DOUBLE PRECISION NOT NULL,
    "net_salary" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayRoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayRollRun" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "PayRollRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryStracture_employeeId_key" ON "SalaryStracture"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PayRollRun_companyId_month_year_key" ON "PayRollRun"("companyId", "month", "year");

-- AddForeignKey
ALTER TABLE "SalaryStracture" ADD CONSTRAINT "SalaryStracture_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStracture" ADD CONSTRAINT "SalaryStracture_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayRoll" ADD CONSTRAINT "PayRoll_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "PayRollRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayRoll" ADD CONSTRAINT "PayRoll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayRollRun" ADD CONSTRAINT "PayRollRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
