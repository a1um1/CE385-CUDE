-- DropForeignKey
ALTER TABLE "refreshToken" DROP CONSTRAINT "refreshToken_userID_fkey";

-- AddForeignKey
ALTER TABLE "refreshToken" ADD CONSTRAINT "refreshToken_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
