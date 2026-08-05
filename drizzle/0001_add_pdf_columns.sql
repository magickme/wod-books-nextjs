-- Adds PDF-library linkage to books.
--
-- These columns are INDEPENDENT of `collected`. `collected` means the user
-- physically owns the book; has_pdf means a PDF exists in the local library.
-- Conflating the two is what corrupted this data once already -- keep them apart.
--
-- Idempotent (IF NOT EXISTS) because the columns were first applied by hand to
-- the live database before this migration existed; running it against that
-- database must be a no-op rather than an error.
--
-- NOTE: this project has no baseline migration. `drizzle-kit generate` emits a
-- full CREATE TABLE baseline that does NOT match production -- the live `books`
-- table has 30 columns while src/lib/db/schema.ts models 21, so a generated
-- baseline would drop real columns. Until a proper baseline is introspected
-- (`drizzle-kit pull`), hand-author incremental migrations like this one.

ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "has_pdf" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "pdf_path" text;
--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "pdf_match_confidence" varchar(10);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_books_has_pdf" ON "books" ("has_pdf") WHERE "has_pdf";
--> statement-breakpoint
COMMENT ON COLUMN "books"."has_pdf" IS 'A PDF of this book exists in the local library. INDEPENDENT of collected (physical ownership).';
--> statement-breakpoint
COMMENT ON COLUMN "books"."pdf_path" IS 'Absolute path to the canonical PDF.';
--> statement-breakpoint
COMMENT ON COLUMN "books"."pdf_match_confidence" IS 'high=exact normalized title; medium=strong fuzzy+line agreement; low=needs review';
