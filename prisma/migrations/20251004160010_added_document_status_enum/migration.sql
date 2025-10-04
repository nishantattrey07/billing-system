/*
  Warnings:

  - The `status` column on the `challans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `quotations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "challans" DROP COLUMN "status",
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "status",
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "quotations" DROP COLUMN "status",
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "challans_companyId_status_createdAt_idx" ON "challans"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "invoices_companyId_status_createdAt_idx" ON "invoices"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "invoices_dueDate_status_idx" ON "invoices"("dueDate", "status");

-- CreateIndex
CREATE INDEX "quotations_companyId_status_createdAt_idx" ON "quotations"("companyId", "status", "createdAt");
