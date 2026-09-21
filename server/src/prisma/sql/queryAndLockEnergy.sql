SELECT "energy", "energyUpdatedAt"
FROM "UserStat"
WHERE "userID" = $1
FOR UPDATE 