import { db } from './index';
import { books, productLines, editions } from './schema';
import { eq, and, or, asc, desc, sql, count } from 'drizzle-orm';

// Get all books with product line and edition data
export async function getAllBooks() {
  return await db
    .select({
      bookId: books.bookId,
      wwCode: books.wwCode,
      title: books.title,
      publicationYear: books.publicationYear,
      isbn10: books.isbn10,
      isbn13: books.isbn13,
      pageCount: books.pageCount,
      collected: books.collected,
      retail: books.retail,
      pod: books.pod,
      seriesName: books.seriesName,
      dataConfidence: books.dataConfidence,
      productLine: {
        productLineId: productLines.productLineId,
        name: productLines.name,
        setting: productLines.setting,
        abbreviation: productLines.abbreviation,
      },
      edition: {
        editionId: editions.editionId,
        name: editions.name,
        sortOrder: editions.sortOrder,
      },
    })
    .from(books)
    .leftJoin(productLines, eq(books.productLineId, productLines.productLineId))
    .leftJoin(editions, eq(books.editionId, editions.editionId))
    .orderBy(asc(books.title));
}

// Get single book by ID
export async function getBookById(bookId: number) {
  const result = await db
    .select()
    .from(books)
    .leftJoin(productLines, eq(books.productLineId, productLines.productLineId))
    .leftJoin(editions, eq(books.editionId, editions.editionId))
    .where(eq(books.bookId, bookId))
    .limit(1);

  return result[0] || null;
}

// Get completion statistics by product line
export async function getCompletionStats() {
  const stats = await db
    .select({
      productLineId: productLines.productLineId,
      productLineName: productLines.name,
      totalBooks: count(books.bookId),
      collectedBooks: sql<number>`SUM(CASE WHEN ${books.collected} = true THEN 1 ELSE 0 END)`,
    })
    .from(productLines)
    .leftJoin(books, eq(books.productLineId, productLines.productLineId))
    .groupBy(productLines.productLineId, productLines.name)
    .orderBy(asc(productLines.name));

  // Calculate percentages
  return stats.map((stat) => ({
    ...stat,
    percentage:
      stat.totalBooks > 0
        ? Math.round((Number(stat.collectedBooks) / stat.totalBooks) * 100)
        : 0,
  }));
}

// Get overall completion stats
export async function getOverallStats() {
  const result = await db
    .select({
      totalBooks: count(books.bookId),
      collectedBooks: sql<number>`SUM(CASE WHEN ${books.collected} = true THEN 1 ELSE 0 END)`,
    })
    .from(books);

  const stats = result[0];
  return {
    totalBooks: stats.totalBooks,
    collectedBooks: Number(stats.collectedBooks),
    percentage:
      stats.totalBooks > 0
        ? Math.round((Number(stats.collectedBooks) / stats.totalBooks) * 100)
        : 0,
  };
}

// Get all product lines with book counts
export async function getProductLines() {
  return await db
    .select({
      productLineId: productLines.productLineId,
      name: productLines.name,
      setting: productLines.setting,
      abbreviation: productLines.abbreviation,
      bookCount: count(books.bookId),
    })
    .from(productLines)
    .leftJoin(books, eq(books.productLineId, productLines.productLineId))
    .groupBy(productLines.productLineId)
    .orderBy(asc(productLines.name));
}

// Get all editions
export async function getEditions() {
  return await db.select().from(editions).orderBy(asc(editions.sortOrder));
}

// Get unique publication years
export async function getPublicationYears() {
  const result = await db
    .selectDistinct({ year: books.publicationYear })
    .from(books)
    .where(sql`${books.publicationYear} IS NOT NULL`)
    .orderBy(desc(books.publicationYear));

  return result.map((r) => r.year).filter((y): y is number => y !== null);
}
