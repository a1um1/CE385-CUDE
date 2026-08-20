-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "reactivatedAt" TIMESTAMP(3);
