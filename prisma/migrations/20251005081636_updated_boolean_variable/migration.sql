/*
  Warnings:

  - You are about to drop the column `populatedByAI` on the `quotations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quotations" DROP COLUMN "populatedByAI",
ADD COLUMN     "isPopulatedByAI" BOOLEAN NOT NULL DEFAULT false;
