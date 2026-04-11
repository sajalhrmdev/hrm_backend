-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255),
    "slug" VARCHAR(255),
    "permissions" TEXT,
    "upper_roles" VARCHAR(255),
    "status_id" BIGINT NOT NULL,
    "company_id" BIGINT DEFAULT 1,
    "branch_id" BIGINT DEFAULT 1,
    "app_login" BOOLEAN DEFAULT true,
    "web_login" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
