import {
  pgTable,
  serial,
  varchar,
  integer,
  smallint,
  boolean,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Product Lines table
export const productLines = pgTable('product_lines', {
  productLineId: serial('product_line_id').primaryKey(),
  // `name` is the SHORT name ("Mage") and is duplicated across oWoD/CoD.
  // `gameLine` ("Mage: The Ascension") is the unique one - filter on that.
  name: varchar('name', { length: 50 }).notNull(),
  abbreviation: varchar('abbreviation', { length: 10 }),
  setting: varchar('setting', { length: 10 }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  gameLine: varchar('game_line', { length: 100 }),
  world: varchar('world', { length: 20 }), // 'oWoD' or 'CoD'
});

// Editions table
export const editions = pgTable('editions', {
  editionId: serial('edition_id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Books table
export const books = pgTable('books', {
  bookId: serial('book_id').primaryKey(),
  wwCode: integer('ww_code'),
  title: varchar('title', { length: 500 }).notNull(),
  productLineId: integer('product_line_id').references(() => productLines.productLineId),
  editionId: integer('edition_id').references(() => editions.editionId),
  wwCodeDisplay: varchar('ww_code_display', { length: 20 }),
  subtitle: varchar('subtitle', { length: 500 }),
  publicationYear: smallint('publication_year'),
  publicationMonth: smallint('publication_month'),
  isbn10: varchar('isbn_10', { length: 13 }),
  isbn13: varchar('isbn_13', { length: 17 }),
  pageCount: smallint('page_count'),
  format: varchar('format', { length: 50 }),
  retail: boolean('retail').default(true),
  pod: boolean('pod').default(false),
  collected: boolean('collected').default(false), // USER TOGGLE FIELD (physical ownership)
  // PDF library linkage - INDEPENDENT of `collected`. A local PDF is not ownership.
  hasPdf: boolean('has_pdf').notNull().default(false),
  pdfPath: text('pdf_path'),
  pdfMatchConfidence: varchar('pdf_match_confidence', { length: 10 }),
  isFiction: boolean('is_fiction').default(false),
  isCoreRulebook: boolean('is_core_rulebook').default(false),
  isLimitedEdition: boolean('is_limited_edition').default(false),
  seriesName: varchar('series_name', { length: 200 }),
  seriesNumber: smallint('series_number'),
  dataSource: text('data_source'),
  dataConfidence: varchar('data_confidence', { length: 10 }),
  needsVerification: boolean('needs_verification').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Authors table
export const authors = pgTable('authors', {
  authorId: serial('author_id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Book-Authors junction table
export const bookAuthors = pgTable('book_authors', {
  bookId: integer('book_id').notNull().references(() => books.bookId, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => authors.authorId, { onDelete: 'cascade' }),
  authorRole: varchar('author_role', { length: 50 }),
  authorOrder: smallint('author_order'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations for Drizzle queries
export const booksRelations = relations(books, ({ one }) => ({
  productLine: one(productLines, {
    fields: [books.productLineId],
    references: [productLines.productLineId],
  }),
  edition: one(editions, {
    fields: [books.editionId],
    references: [editions.editionId],
  }),
}));

export const productLinesRelations = relations(productLines, ({ many }) => ({
  books: many(books),
}));

export const editionsRelations = relations(editions, ({ many }) => ({
  books: many(books),
}));

// Type exports for TypeScript
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type ProductLine = typeof productLines.$inferSelect;
export type Edition = typeof editions.$inferSelect;
export type Author = typeof authors.$inferSelect;

// Extended type for books with relations
export type BookWithRelations = Book & {
  productLine: ProductLine | null;
  edition: Edition | null;
};
