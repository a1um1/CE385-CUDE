-- AlterTable
ALTER TABLE "Sessions" ADD COLUMN     "rewarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Sessions_userID_LessonID_key" ON "Sessions"("userID", "LessonID") WHERE (rewarded = true);
