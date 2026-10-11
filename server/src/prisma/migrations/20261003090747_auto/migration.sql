/*
  Warnings:

  - You are about to drop the column `order` on the `TestCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Course_position_id_idx" ON "Course"("position", "id");

-- CreateIndex
CREATE INDEX "Exercise_lessonID_position_id_idx" ON "Exercise"("lessonID", "position", "id");

-- CreateIndex
CREATE INDEX "Lesson_unitID_position_id_idx" ON "Lesson"("unitID", "position", "id");

-- CreateIndex
CREATE INDEX "TestCase_codeExerciseID_id_idx" ON "TestCase"("codeExerciseID", "id");

-- CreateIndex
CREATE INDEX "Transactions_userID_id_idx" ON "Transactions"("userID", "id");

-- CreateIndex
CREATE INDEX "Unit_courseID_position_id_idx" ON "Unit"("courseID", "position", "id");
