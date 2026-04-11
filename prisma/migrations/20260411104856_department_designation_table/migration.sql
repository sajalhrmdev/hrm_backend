-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "status_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),
    "company_id" INTEGER DEFAULT 1,
    "branch_id" INTEGER DEFAULT 1,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);
