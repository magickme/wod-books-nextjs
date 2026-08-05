-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SEQUENCE "public"."data_migration_log_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."ownership_audit_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."line_reassign_audit_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."pdf_link_audit_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."merge_audit_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."author_cleanup_audit_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "editions" (
	"edition_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "editions_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_lines" (
	"product_line_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"abbreviation" varchar(10),
	"setting" varchar(10),
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"game_line" varchar(100),
	"world" varchar(20),
	CONSTRAINT "product_lines_game_line_key" UNIQUE("game_line"),
	CONSTRAINT "product_lines_setting_check" CHECK ((setting)::text = ANY ((ARRAY['oWoD'::character varying, 'nWoD'::character varying, 'CofD'::character varying, 'other'::character varying, NULL::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "books" (
	"book_id" serial PRIMARY KEY NOT NULL,
	"ww_code" integer,
	"ww_code_display" varchar(20),
	"title" varchar(500) NOT NULL,
	"subtitle" varchar(500),
	"product_line_id" integer,
	"edition_id" integer,
	"publication_year" smallint,
	"publication_month" smallint,
	"isbn_10" varchar(13),
	"isbn_13" varchar(17),
	"page_count" smallint,
	"format" varchar(50),
	"retail" boolean DEFAULT true,
	"pod" boolean DEFAULT false,
	"collected" boolean DEFAULT false,
	"is_fiction" boolean DEFAULT false,
	"is_core_rulebook" boolean DEFAULT false,
	"is_limited_edition" boolean DEFAULT false,
	"series_name" varchar(200),
	"series_number" smallint,
	"data_source" text,
	"data_confidence" varchar(10),
	"needs_verification" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"has_pdf" boolean DEFAULT false NOT NULL,
	"pdf_path" text,
	"pdf_match_confidence" varchar(10),
	CONSTRAINT "books_publication_year_check" CHECK ((publication_year >= 1991) AND (publication_year <= 2025)),
	CONSTRAINT "books_publication_month_check" CHECK ((publication_month >= 1) AND (publication_month <= 12)),
	CONSTRAINT "books_page_count_check" CHECK (page_count > 0),
	CONSTRAINT "books_data_confidence_check" CHECK ((data_confidence)::text = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying])::text[])),
	CONSTRAINT "valid_series_number" CHECK (series_number > 0),
	CONSTRAINT "valid_ww_code" CHECK ((ww_code IS NULL) OR (ww_code >= 0))
);
--> statement-breakpoint
CREATE TABLE "authors" (
	"author_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "authors_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "book_authors" (
	"book_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"author_role" varchar(50),
	"author_order" smallint,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "book_authors_pkey" PRIMARY KEY("author_id","book_id"),
	CONSTRAINT "valid_author_order" CHECK (author_order > 0)
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_product_line_id_fkey" FOREIGN KEY ("product_line_id") REFERENCES "public"."product_lines"("product_line_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("edition_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("book_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("author_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_editions_sort_order" ON "editions" USING btree ("sort_order" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_books_core_rulebook" ON "books" USING btree ("is_core_rulebook" bool_ops) WHERE (is_core_rulebook = true);--> statement-breakpoint
CREATE INDEX "idx_books_data_confidence" ON "books" USING btree ("data_confidence" text_ops) WHERE (data_confidence IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_data_source" ON "books" USING btree ("data_source" text_ops) WHERE (data_source IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_edition_id" ON "books" USING btree ("edition_id" int4_ops) WHERE (edition_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_has_pdf" ON "books" USING btree ("has_pdf" bool_ops) WHERE has_pdf;--> statement-breakpoint
CREATE INDEX "idx_books_is_fiction" ON "books" USING btree ("is_fiction" bool_ops) WHERE (is_fiction = true);--> statement-breakpoint
CREATE INDEX "idx_books_isbn_10" ON "books" USING btree ("isbn_10" text_ops) WHERE (isbn_10 IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_isbn_13" ON "books" USING btree ("isbn_13" text_ops) WHERE (isbn_13 IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_needs_verification" ON "books" USING btree ("needs_verification" bool_ops) WHERE (needs_verification = true);--> statement-breakpoint
CREATE INDEX "idx_books_pod" ON "books" USING btree ("pod" bool_ops) WHERE (pod = true);--> statement-breakpoint
CREATE INDEX "idx_books_product_line_id" ON "books" USING btree ("product_line_id" int4_ops) WHERE (product_line_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_publication_date" ON "books" USING btree ("publication_year" int2_ops,"publication_month" int2_ops) WHERE (publication_year IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_publication_year" ON "books" USING btree ("publication_year" int2_ops) WHERE (publication_year IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_retail" ON "books" USING btree ("retail" bool_ops) WHERE (retail = true);--> statement-breakpoint
CREATE INDEX "idx_books_series_name" ON "books" USING btree ("series_name" text_ops) WHERE (series_name IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_series_order" ON "books" USING btree ("series_name" text_ops,"series_number" int2_ops) WHERE (series_name IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_books_title" ON "books" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "idx_books_title_fulltext" ON "books" USING gin (to_tsvector('english'::regconfig, (title)::text) tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_books_title_subtitle_fulltext" ON "books" USING gin (to_tsvector('english'::regconfig, (((COALESCE(title, ''::charac tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_books_ww_code" ON "books" USING btree ("ww_code" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_authors_name" ON "authors" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_book_authors_author_id" ON "book_authors" USING btree ("author_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_book_authors_book_id" ON "book_authors" USING btree ("book_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_book_authors_order" ON "book_authors" USING btree ("book_id" int4_ops,"author_order" int4_ops) WHERE (author_order IS NOT NULL);
*/