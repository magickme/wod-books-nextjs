# Migrations

`0000_introspected_baseline.sql` was produced by `drizzle-kit pull` against the
live database and is **commented out on purpose** — the tables already exist.
It is a record of the starting state, not something to execute. `meta/` holds
the snapshot that makes future `drizzle-kit generate` runs incremental.

## Before you run `drizzle-kit generate`

`src/lib/db/schema.ts` now models all 30 `books` columns (it modelled 21, which
is how a hand-applied `ALTER TABLE` shipped with no migration). Keep it that
way: any column present in the database but absent from `schema.ts` shows up in
the next generated migration as a `DROP COLUMN`.

**Known limitation.** `generate` still emits `DROP CONSTRAINT` for 16 unique and
check constraints (`books_publication_year_check`, `product_lines_game_line_key`,
`valid_ww_code`, the four foreign keys, …) because this version of Drizzle's TS
DSL cannot express them. **Always read a generated migration before applying it
and delete those `DROP CONSTRAINT` lines.** They protect real invariants.

## Never use `drizzle-kit push`

`push` diffs and applies without review, so it would silently drop those
constraints. Use `generate` + manual review, always.

## Scope

`drizzle.config.ts` sets `tablesFilter` to the five app tables. The database also
holds audit tables (`ownership_audit`, `line_reassign_audit`, `pdf_link_audit`,
`merge_audit`, `author_cleanup_audit`) that are the rollback record for the
2026-08-05 data repair, plus pre-migration backups (`ww_books_*`) and unrelated
legacy tables. Without the filter, Drizzle would try to manage all of them.
