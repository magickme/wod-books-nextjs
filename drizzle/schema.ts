import { pgTable, index, unique, serial, varchar, integer, text, timestamp, check, foreignKey, smallint, boolean, primaryKey, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const dataMigrationLogLogIdSeq = pgSequence("data_migration_log_log_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const ownershipAuditAuditIdSeq = pgSequence("ownership_audit_audit_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const lineReassignAuditAuditIdSeq = pgSequence("line_reassign_audit_audit_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const pdfLinkAuditAuditIdSeq = pgSequence("pdf_link_audit_audit_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const mergeAuditAuditIdSeq = pgSequence("merge_audit_audit_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const authorCleanupAuditAuditIdSeq = pgSequence("author_cleanup_audit_audit_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })

export const editions = pgTable("editions", {
	editionId: serial("edition_id").primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_editions_sort_order").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
	unique("editions_name_key").on(table.name),
]);

export const productLines = pgTable("product_lines", {
	productLineId: serial("product_line_id").primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	abbreviation: varchar({ length: 10 }),
	setting: varchar({ length: 10 }),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	gameLine: varchar("game_line", { length: 100 }),
	world: varchar({ length: 20 }),
}, (table) => [
	unique("product_lines_game_line_key").on(table.gameLine),
	check("product_lines_setting_check", sql`(setting)::text = ANY ((ARRAY['oWoD'::character varying, 'nWoD'::character varying, 'CofD'::character varying, 'other'::character varying, NULL::character varying])::text[])`),
]);

export const books = pgTable("books", {
	bookId: serial("book_id").primaryKey().notNull(),
	wwCode: integer("ww_code"),
	wwCodeDisplay: varchar("ww_code_display", { length: 20 }),
	title: varchar({ length: 500 }).notNull(),
	subtitle: varchar({ length: 500 }),
	productLineId: integer("product_line_id"),
	editionId: integer("edition_id"),
	publicationYear: smallint("publication_year"),
	publicationMonth: smallint("publication_month"),
	isbn10: varchar("isbn_10", { length: 13 }),
	isbn13: varchar("isbn_13", { length: 17 }),
	pageCount: smallint("page_count"),
	format: varchar({ length: 50 }),
	retail: boolean().default(true),
	pod: boolean().default(false),
	collected: boolean().default(false),
	isFiction: boolean("is_fiction").default(false),
	isCoreRulebook: boolean("is_core_rulebook").default(false),
	isLimitedEdition: boolean("is_limited_edition").default(false),
	seriesName: varchar("series_name", { length: 200 }),
	seriesNumber: smallint("series_number"),
	dataSource: text("data_source"),
	dataConfidence: varchar("data_confidence", { length: 10 }),
	needsVerification: boolean("needs_verification").default(false),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	hasPdf: boolean("has_pdf").default(false).notNull(),
	pdfPath: text("pdf_path"),
	pdfMatchConfidence: varchar("pdf_match_confidence", { length: 10 }),
}, (table) => [
	index("idx_books_core_rulebook").using("btree", table.isCoreRulebook.asc().nullsLast().op("bool_ops")).where(sql`(is_core_rulebook = true)`),
	index("idx_books_data_confidence").using("btree", table.dataConfidence.asc().nullsLast().op("text_ops")).where(sql`(data_confidence IS NOT NULL)`),
	index("idx_books_data_source").using("btree", table.dataSource.asc().nullsLast().op("text_ops")).where(sql`(data_source IS NOT NULL)`),
	index("idx_books_edition_id").using("btree", table.editionId.asc().nullsLast().op("int4_ops")).where(sql`(edition_id IS NOT NULL)`),
	index("idx_books_has_pdf").using("btree", table.hasPdf.asc().nullsLast().op("bool_ops")).where(sql`has_pdf`),
	index("idx_books_is_fiction").using("btree", table.isFiction.asc().nullsLast().op("bool_ops")).where(sql`(is_fiction = true)`),
	index("idx_books_isbn_10").using("btree", table.isbn10.asc().nullsLast().op("text_ops")).where(sql`(isbn_10 IS NOT NULL)`),
	index("idx_books_isbn_13").using("btree", table.isbn13.asc().nullsLast().op("text_ops")).where(sql`(isbn_13 IS NOT NULL)`),
	index("idx_books_needs_verification").using("btree", table.needsVerification.asc().nullsLast().op("bool_ops")).where(sql`(needs_verification = true)`),
	index("idx_books_pod").using("btree", table.pod.asc().nullsLast().op("bool_ops")).where(sql`(pod = true)`),
	index("idx_books_product_line_id").using("btree", table.productLineId.asc().nullsLast().op("int4_ops")).where(sql`(product_line_id IS NOT NULL)`),
	index("idx_books_publication_date").using("btree", table.publicationYear.asc().nullsLast().op("int2_ops"), table.publicationMonth.asc().nullsLast().op("int2_ops")).where(sql`(publication_year IS NOT NULL)`),
	index("idx_books_publication_year").using("btree", table.publicationYear.asc().nullsLast().op("int2_ops")).where(sql`(publication_year IS NOT NULL)`),
	index("idx_books_retail").using("btree", table.retail.asc().nullsLast().op("bool_ops")).where(sql`(retail = true)`),
	index("idx_books_series_name").using("btree", table.seriesName.asc().nullsLast().op("text_ops")).where(sql`(series_name IS NOT NULL)`),
	index("idx_books_series_order").using("btree", table.seriesName.asc().nullsLast().op("text_ops"), table.seriesNumber.asc().nullsLast().op("int2_ops")).where(sql`(series_name IS NOT NULL)`),
	index("idx_books_title").using("btree", table.title.asc().nullsLast().op("text_ops")),
	index("idx_books_title_fulltext").using("gin", sql`to_tsvector('english'::regconfig, (title)::text)`),
	index("idx_books_title_subtitle_fulltext").using("gin", sql`to_tsvector('english'::regconfig, (((COALESCE(title, ''::charac`),
	index("idx_books_ww_code").using("btree", table.wwCode.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.productLineId],
			foreignColumns: [productLines.productLineId],
			name: "books_product_line_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.editionId],
			foreignColumns: [editions.editionId],
			name: "books_edition_id_fkey"
		}).onDelete("set null"),
	check("books_publication_year_check", sql`(publication_year >= 1991) AND (publication_year <= 2025)`),
	check("books_publication_month_check", sql`(publication_month >= 1) AND (publication_month <= 12)`),
	check("books_page_count_check", sql`page_count > 0`),
	check("books_data_confidence_check", sql`(data_confidence)::text = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying])::text[])`),
	check("valid_series_number", sql`series_number > 0`),
	check("valid_ww_code", sql`(ww_code IS NULL) OR (ww_code >= 0)`),
]);

export const authors = pgTable("authors", {
	authorId: serial("author_id").primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_authors_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("authors_name_key").on(table.name),
]);

export const bookAuthors = pgTable("book_authors", {
	bookId: integer("book_id").notNull(),
	authorId: integer("author_id").notNull(),
	authorRole: varchar("author_role", { length: 50 }),
	authorOrder: smallint("author_order"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_book_authors_author_id").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("idx_book_authors_book_id").using("btree", table.bookId.asc().nullsLast().op("int4_ops")),
	index("idx_book_authors_order").using("btree", table.bookId.asc().nullsLast().op("int4_ops"), table.authorOrder.asc().nullsLast().op("int4_ops")).where(sql`(author_order IS NOT NULL)`),
	foreignKey({
			columns: [table.bookId],
			foreignColumns: [books.bookId],
			name: "book_authors_book_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [authors.authorId],
			name: "book_authors_author_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.authorId, table.bookId], name: "book_authors_pkey"}),
	check("valid_author_order", sql`author_order > 0`),
]);
