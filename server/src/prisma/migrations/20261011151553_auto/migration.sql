-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "startAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LessonPrerequisite" (
    "lessonID" UUID NOT NULL,
    "prerequisiteLessonID" UUID NOT NULL,

    CONSTRAINT "LessonPrerequisite_pkey" PRIMARY KEY ("lessonID","prerequisiteLessonID")
);

-- CreateIndex
CREATE INDEX "LessonPrerequisite_prerequisiteLessonID_idx" ON "LessonPrerequisite"("prerequisiteLessonID");

-- AddForeignKey
ALTER TABLE "LessonPrerequisite" ADD CONSTRAINT "LessonPrerequisite_lessonID_fkey" FOREIGN KEY ("lessonID") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPrerequisite" ADD CONSTRAINT "LessonPrerequisite_prerequisiteLessonID_fkey" FOREIGN KEY ("prerequisiteLessonID") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
