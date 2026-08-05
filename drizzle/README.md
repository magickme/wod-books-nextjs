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

**A generated migration is a DRAFT, never runnable as-is.** Measured against
commit 7c096f9 (`drizzle-kit generate`, v0.31.10) — `DROP COLUMN` is 0, which
was the point of the baseline, but four categories of destruction remain:

| What | Count | Consequence |
|---|---|---|
| `DROP INDEX` with **no** `CREATE INDEX` | 25 | every index destroyed, including the two GIN full-text indexes on `books.title` |
| `DROP CONSTRAINT` | 16 | unique keys, all check constraints (`valid_ww_code`, `books_publication_year_check`), and the four FKs |
| `book_authors_pkey` dropped, never restored | 1 | composite primary key lost |
| `DROP SEQUENCE` on **audit** tables | 6 | see below — `tablesFilter` does not stop this |

The foreign keys are dropped and re-added (Drizzle renames them), so those four
are fine. The indexes, checks, unique keys and primary key are **not** restored.

### tablesFilter does not protect sequences

Despite `tablesFilter` listing only the five app tables, `generate` still emits
`DROP SEQUENCE` for `ownership_audit`, `line_reassign_audit`, `pdf_link_audit`,
`merge_audit`, `author_cleanup_audit` and `data_migration_log` — the audit
tables that are the rollback record for the 2026-08-05 data repair.

Verified consequence: the plain `DROP SEQUENCE` aborts with a dependency error,
and `DROP ... CASCADE` removes the column default, after which the audit table
rejects every insert (`null value in column "audit_id" violates not-null
constraint`). Delete these lines.

## Workflow

1. `drizzle-kit generate`
2. **Read the whole file.** Delete every `DROP INDEX`, `DROP CONSTRAINT`,
   `DROP SEQUENCE`, and the `book_authors_pkey` drop, unless you specifically
   intend them.
3. Apply what remains.

## Never use `drizzle-kit push`

`push` diffs and applies without review. On this database that means silently
destroying 25 indexes, 16 constraints, a primary key, and the audit sequences.
Use `generate` plus manual review, always.

## Scope

`drizzle.config.ts` sets `tablesFilter` to the five app tables. The database also
holds audit tables (`ownership_audit`, `line_reassign_audit`, `pdf_link_audit`,
`merge_audit`, `author_cleanup_audit`) that are the rollback record for the
2026-08-05 data repair, plus pre-migration backups (`ww_books_*`) and unrelated
legacy tables. Without the filter, Drizzle would try to manage all of them.
