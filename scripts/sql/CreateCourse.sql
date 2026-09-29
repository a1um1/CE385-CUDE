INSERT INTO "Course" (id, name, "createdByID", "color", "icon", "createdAt", "updatedAt")
	VALUES (uuidv7(), :name, :createByID, :color, :icon, now(), now())
	RETURNING *;