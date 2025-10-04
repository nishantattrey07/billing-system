/*
  Warnings:

  - Added the required column `user_id` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "companies_user_id_created_at_idx" ON "companies"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "customers_user_id_created_at_idx" ON "customers"("user_id", "created_at");
