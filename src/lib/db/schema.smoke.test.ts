/**
 * Schema smoke test.
 *
 * The rest of the suite is pure functions over hand-built fixtures, so it can
 * pass while the running database is missing a column the app selects. That is
 * exactly how `has_pdf` shipped: typecheck validated the Drizzle *declaration*,
 * not the live table, and every test was green against a database that would
 * have 500'd.
 *
 * This test connects for real and asserts that every column the app selects
 * actually exists. It SKIPS (does not fail) when no database is reachable, so
 * it stays usable in environments without one.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'postgres',
  user: process.env.DATABASE_USER || 'order',
  password: process.env.DATABASE_PASSWORD,
  connectionTimeoutMillis: 5000,
});

let reachable = false;

beforeAll(async () => {
  try {
    await pool.query('SELECT 1');
    reachable = true;
  } catch {
    reachable = false;
  }
});

afterAll(async () => {
  await pool.end().catch(() => {});
});

describe('database schema matches what the app selects', () => {
  it('books has every column the app queries', async () => {
    if (!reachable) {
      console.warn('no database reachable - skipping schema smoke test');
      return;
    }

    const required = [
      'book_id', 'ww_code', 'title', 'product_line_id', 'edition_id',
      'publication_year', 'isbn_10', 'isbn_13', 'page_count', 'collected',
      'retail', 'pod', 'series_name', 'data_confidence',
      // added by drizzle/0001_add_pdf_columns.sql
      'has_pdf', 'pdf_path',
    ];

    const { rows } = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'books'`
    );
    const present = new Set(rows.map((r) => r.column_name));
    const missing = required.filter((c) => !present.has(c));

    expect(missing, `missing columns (run drizzle/ migrations): ${missing.join(', ')}`).toEqual([]);
  });

  it('product_lines exposes game_line and world for line disambiguation', async () => {
    if (!reachable) return;
    const { rows } = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'product_lines'`
    );
    const present = new Set(rows.map((r) => r.column_name));
    expect(present.has('game_line')).toBe(true);
    expect(present.has('world')).toBe(true);
  });

  it('the real getAllBooks projection executes without error', async () => {
    if (!reachable) return;
    // Mirrors the columns getAllBooks() selects; fails loudly on schema drift.
    await expect(
      pool.query(`
        SELECT b.book_id, b.ww_code, b.title, b.publication_year, b.isbn_10,
               b.isbn_13, b.page_count, b.collected, b.has_pdf, b.pdf_path,
               b.retail, b.pod, b.series_name, b.data_confidence,
               pl.game_line, pl.world, e.name AS edition_name,
               (SELECT string_agg(a.name, ', ' ORDER BY a.name)
                  FROM book_authors ba JOIN authors a ON a.author_id = ba.author_id
                 WHERE ba.book_id = b.book_id) AS authors
          FROM books b
          LEFT JOIN product_lines pl ON b.product_line_id = pl.product_line_id
          LEFT JOIN editions e ON b.edition_id = e.edition_id
         LIMIT 1
      `)
    ).resolves.toBeDefined();
  });
});
