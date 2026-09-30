INSERT INTO "Unit" (id, name, "courseID", "createdAt", "updatedAt")
	VALUES (uuidv7(), :name, :courseid, now(), now())
	RETURNING *;