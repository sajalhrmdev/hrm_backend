/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `GlobalRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GlobalRole_name_key" ON "GlobalRole"("name");
