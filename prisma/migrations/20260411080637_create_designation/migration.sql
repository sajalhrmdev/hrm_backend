-- CreateTable
CREATE TABLE "designations" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "status_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "company_id" BIGINT DEFAULT 1,
    "branch_id" BIGINT DEFAULT 1,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);
