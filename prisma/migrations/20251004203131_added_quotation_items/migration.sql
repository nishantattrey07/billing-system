/*
  Warnings:

  - You are about to drop the column `items` on the `quotations` table. All the data in the column will be lost.
  - Added the required column `subject` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerId` on table `quotations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."quotations" DROP CONSTRAINT "quotations_customerId_fkey";

-- AlterTable
ALTER TABLE "quotations" DROP COLUMN "items",
ADD COLUMN     "customerCity" TEXT,
ADD COLUMN     "customerState" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "freightCharges" DECIMAL(12,3) NOT NULL DEFAULT 0,
ADD COLUMN     "populatedByAI" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "safetyCheckCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "terms" TEXT,
ADD COLUMN     "validUntil" TIMESTAMP(3),
ALTER COLUMN "customerId" SET NOT NULL,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(15,3),
ALTER COLUMN "cgst" SET DATA TYPE DECIMAL(15,3),
ALTER COLUMN "sgst" SET DATA TYPE DECIMAL(15,3),
ALTER COLUMN "igst" SET DATA TYPE DECIMAL(15,3),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(15,2);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" UUID NOT NULL,
    "quotationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "remarks" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'NOS',
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(15,3) NOT NULL,
    "discount" DECIMAL(5,2),
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotation_items_quotationId_sortOrder_idx" ON "quotation_items"("quotationId", "sortOrder");

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
