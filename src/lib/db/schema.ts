import {
  pgTable,
  serial,
  varchar,
  integer,
  smallint,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Product Lines table
export const productLines = pgTable('product_lines', {
  productLineId: serial('product_line_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  setting: varchar('setting', { length: 255 }),
  abbreviation: varchar('abbreviation', { length: 50 }),
  gameLine: varchar('game_line', { length: 100 }),
  world: varchar('world', { length: 20 }), // 'oWoD' or 'CoD'
});

// Editions table
export const editions = pgTable('editions', {
  editionId: serial('edition_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0),
});

// Books table
export const books = pgTable('books', {
  bookId: serial('book_id').primaryKey(),
  wwCode: integer('ww_code'),
  title: varchar('title', { length: 500 }).notNull(),
  productLineId: integer('product_line_id').references(() => productLines.productLineId),
  editionId: integer('edition_id').references(() => editions.editionId),
  publicationYear: smallint('publication_year'),
  isbn10: varchar('isbn_10', { length: 20 }),
  isbn13: varchar('isbn_13', { length: 20 }),
  pageCount: smallint('page_count'),
  retail: boolean('retail').default(false),
  pod: boolean('pod').default(false),
  collected: boolean('collected').default(false), // USER TOGGLE FIELD
  seriesName: varchar('series_name', { length: 255 }),
  dataSource: varchar('data_source', { length: 100 }),
  dataConfidence: varchar('data_confidence', { length: 50 }),
  needsVerification: boolean('needs_verification').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Authors table
export const authors = pgTable('authors', {
  authorId: serial('author_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

// Book-Authors junction table
export const bookAuthors = pgTable('book_authors', {
  bookId: integer('book_id').references(() => books.bookId),
  authorId: integer('author_id').references(() => authors.authorId),
  authorRole: varchar('author_role', { length: 100 }),
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
