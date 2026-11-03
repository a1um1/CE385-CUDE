-- Backfill missing submissions for CODE exercises in closed (SUBMITTED/GRADED) sessions
INSERT INTO "Submission" ("id", "userID", "SessionID", "exerciseID", "content", "isGraded", "ok", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  s."userID",
  s."id",
  e."id",
  '{"code":""}'::jsonb,
  true,
  false,
  s."updatedAt",
  s."updatedAt"
FROM "Sessions" s
JOIN "Exercise" e ON e."lessonID" = s."LessonID" AND e."type" = 'CODE'
LEFT JOIN "Submission" sub ON sub."SessionID" = s."id" AND sub."exerciseID" = e."id"
WHERE s."status" IN ('SUBMITTED', 'GRADED')
  AND sub."id" IS NULL;
