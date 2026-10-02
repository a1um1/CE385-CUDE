INSERT INTO "Lesson" (id, name, "unitID", "passThreshold", "XPgiven", "gemsGiven", "createdAt", "updatedAt")
	VALUES (uuidv7(), :name, :unitid, :passThreshold, :xpgiven, :gemsgiven, now(), now())
	RETURNING *;