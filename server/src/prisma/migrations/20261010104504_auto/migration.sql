-- AlterTable
ALTER TABLE "CodeExercise" ADD COLUMN     "allowedFunctions" TEXT[] DEFAULT ARRAY[]::TEXT[];
