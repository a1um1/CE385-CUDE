/*
  Warnings:

  - You are about to drop the column `exerciseID` on the `TestCase` table. All the data in the column will be lost.
  - Added the required column `codeExerciseID` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EXERCISE_TYPE" AS ENUM ('NONE', 'CODE');

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_exerciseID_fkey";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "type" "EXERCISE_TYPE" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "exerciseID",
ADD COLUMN     "codeExerciseID" UUID NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CodeExercise" (
    "id" UUID NOT NULL,
    "exerciseID" UUID NOT NULL,
    "starterCode" TEXT,
    "testerCode" TEXT,
    "timeLimitMs" INTEGER NOT NULL DEFAULT 2000,
    "memoryLimitMb" INTEGER NOT NULL DEFAULT 256,

    CONSTRAINT "CodeExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "exerciseID" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeExercise_exerciseID_key" ON "CodeExercise"("exerciseID");

-- AddForeignKey
ALTER TABLE "CodeExercise" ADD CONSTRAINT "CodeExercise_exerciseID_fkey" FOREIGN KEY ("exerciseID") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_codeExerciseID_fkey" FOREIGN KEY ("codeExerciseID") REFERENCES "CodeExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_exerciseID_fkey" FOREIGN KEY ("exerciseID") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
