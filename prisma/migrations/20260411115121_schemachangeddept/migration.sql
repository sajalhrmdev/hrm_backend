-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "branch_id" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "company_id" INTEGER NOT NULL DEFAULT 1;
