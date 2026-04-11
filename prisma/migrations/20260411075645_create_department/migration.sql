-- CreateTable
CREATE TABLE "departments" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "statusId" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "company_id" BIGINT NOT NULL DEFAULT 1,
    "branch_id" BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);
