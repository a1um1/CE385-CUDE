/*
  Warnings:

  - Added the required column `color` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL;
