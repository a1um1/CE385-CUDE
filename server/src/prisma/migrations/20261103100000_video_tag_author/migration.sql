-- Rename description -> author
ALTER TABLE "Video" RENAME COLUMN "description" TO "author";

-- Separate tags into their own table
CREATE TABLE "VideoTag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoTag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VideoTag_name_key" ON "VideoTag"("name");

CREATE TABLE "_VideoToVideoTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_VideoToVideoTag_AB_unique" UNIQUE ("A", "B")
);

CREATE INDEX "_VideoToVideoTag_B_index" ON "_VideoToVideoTag"("B");

ALTER TABLE "_VideoToVideoTag"
    ADD CONSTRAINT "_VideoToVideoTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_VideoToVideoTag"
    ADD CONSTRAINT "_VideoToVideoTag_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill tags from the old array column
INSERT INTO "VideoTag" ("id", "name")
SELECT DISTINCT gen_random_uuid(), lower(tag)
FROM "Video" v, unnest(v."tags") AS tag;

INSERT INTO "_VideoToVideoTag" ("A", "B")
SELECT DISTINCT v."id", t."id"
FROM "Video" v, unnest(v."tags") AS tag
JOIN "VideoTag" t ON t."name" = lower(tag);

ALTER TABLE "Video" DROP COLUMN "tags";
