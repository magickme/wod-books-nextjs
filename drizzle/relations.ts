import { relations } from "drizzle-orm/relations";
import { productLines, books, editions, bookAuthors, authors } from "./schema";

export const booksRelations = relations(books, ({one, many}) => ({
	productLine: one(productLines, {
		fields: [books.productLineId],
		references: [productLines.productLineId]
	}),
	edition: one(editions, {
		fields: [books.editionId],
		references: [editions.editionId]
	}),
	bookAuthors: many(bookAuthors),
}));

export const productLinesRelations = relations(productLines, ({many}) => ({
	books: many(books),
}));

export const editionsRelations = relations(editions, ({many}) => ({
	books: many(books),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({one}) => ({
	book: one(books, {
		fields: [bookAuthors.bookId],
		references: [books.bookId]
	}),
	author: one(authors, {
		fields: [bookAuthors.authorId],
		references: [authors.authorId]
	}),
}));

export const authorsRelations = relations(authors, ({many}) => ({
	bookAuthors: many(bookAuthors),
}));