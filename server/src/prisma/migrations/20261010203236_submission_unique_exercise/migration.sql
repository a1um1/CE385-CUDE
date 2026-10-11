-- CreateIndex
CREATE UNIQUE INDEX "Submission_SessionID_exerciseID_key" ON "Submission"("SessionID", "exerciseID");
