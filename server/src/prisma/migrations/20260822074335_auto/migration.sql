-- CreateEnum
CREATE TYPE "logStatus" AS ENUM ('SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "Log" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "status" "logStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
