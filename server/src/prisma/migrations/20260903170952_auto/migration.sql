-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ENERGY', 'GEM', 'XP');

-- CreateTable
CREATE TABLE "Transactions" (
    "id" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "afterAmount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
