import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // The database also holds audit tables (ownership_audit, line_reassign_audit,
  // pdf_link_audit, merge_audit, author_cleanup_audit), pre-migration backups
  // (ww_books_*), and unrelated legacy tables. The app owns only these five --
  // without this filter, `drizzle-kit pull`/`generate` would try to manage all
  // of them and `push` could drop them.
  tablesFilter: ['books', 'product_lines', 'editions', 'authors', 'book_authors'],
  dbCredentials: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'order',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'postgres',
  },
} satisfies Config;
