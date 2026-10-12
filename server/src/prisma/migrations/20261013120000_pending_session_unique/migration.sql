-- CreateIndex
CREATE UNIQUE INDEX "Sessions_userID_key" ON "Sessions"("userID") WHERE (status = 'PENDING');
