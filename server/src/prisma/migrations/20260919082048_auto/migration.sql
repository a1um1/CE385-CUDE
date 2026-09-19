/*
  Warnings:

  - You are about to alter the column `passTheshold` on the `Lesson` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.

*/
-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "passTheshold" SET DATA TYPE DECIMAL(3,2);
