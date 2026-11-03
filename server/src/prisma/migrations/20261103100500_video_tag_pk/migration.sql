-- Prisma implicit many-to-many uses a composite primary key, not a unique index.
-- The constraint (not the index) must be dropped first.
ALTER TABLE "_VideoToVideoTag" DROP CONSTRAINT IF EXISTS "_VideoToVideoTag_AB_unique";

-- The failed `20261103063415_auto` migration may have added the primary key before
-- failing, so only add it when it is missing.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_VideoToVideoTag_AB_pkey'
    ) THEN
        ALTER TABLE "_VideoToVideoTag" ADD CONSTRAINT "_VideoToVideoTag_AB_pkey" PRIMARY KEY ("A", "B");
    END IF;
END $$;
