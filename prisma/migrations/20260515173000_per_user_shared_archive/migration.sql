ALTER TABLE "note_shares" ADD COLUMN "is_archived" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "note_shares_shared_with_user_id_is_archived_idx" ON "note_shares"("shared_with_user_id", "is_archived");
