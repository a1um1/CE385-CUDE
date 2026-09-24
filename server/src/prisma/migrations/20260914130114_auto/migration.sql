/*
  Warnings:

  - Added the required column `SessionID` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "SessionID" UUID NOT NULL,
ADD COLUMN     "isGraded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ok" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Sessions" (
    "id" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "LessonID" UUID NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_LessonID_fkey" FOREIGN KEY ("LessonID") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_SessionID_fkey" FOREIGN KEY ("SessionID") REFERENCES "Sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
