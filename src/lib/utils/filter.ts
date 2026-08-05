import type { BookRow } from '@/lib/db/queries';

export type WorldFilter = 'all' | 'oWoD' | 'CoD';
export type CollectedFilter = 'all' | 'collected' | 'uncollected';
export type SortKey = 'title' | 'publicationYear' | 'wwCode' | 'collected';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  searchTerm: string;
  productLine: string;
  edition: string;
  year: string;
  collected: CollectedFilter;
  world: WorldFilter;
}

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

function getSearchableFields(book: BookRow): string[] {
  const fields: string[] = [
    book.title,
    book.productLine?.name ?? '',
    book.productLine?.abbreviation ?? '',
    book.productLine?.gameLine ?? '',
    book.seriesName ?? '',
    book.isbn10 ?? '',
    book.isbn13 ?? '',
    book.wwCode != null ? String(book.wwCode) : '',
    book.edition?.name ?? '',
  ];
  return fields.filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function fuzzyMaxDistance(termLength: number): number {
  if (termLength <= 3) return 0;
  if (termLength <= 5) return 1;
  return 2;
}

function wordMatchesField(word: string, field: string): boolean {
  if (field.includes(word)) return true;

  const maxDist = fuzzyMaxDistance(word.length);
  if (maxDist === 0) return false;

  const fieldWords = field.split(/[\s:,\-/]+/).filter((w) => w.length > 0);
  for (const fw of fieldWords) {
    if (fw.length < word.length - maxDist || fw.length > word.length + maxDist) continue;
    if (levenshtein(word, fw) <= maxDist) return true;
  }

  return false;
}

function bookMatchesWord(book: BookRow, word: string): boolean {
  const fields = getSearchableFields(book);
  for (const field of fields) {
    if (wordMatchesField(word, field.toLowerCase())) return true;
  }
  return false;
}

function bookMatchesSearch(book: BookRow, searchTerm: string): boolean {
  const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  return words.every((word) => bookMatchesWord(book, word));
}

export function filterAndSortBooks(
  books: BookRow[],
  filters: FilterState,
  sort: SortConfig
): BookRow[] {
  let result = [...books];

  if (filters.world !== 'all') {
    result = result.filter((book) => book.productLine?.world === filters.world);
  }

  if (filters.searchTerm) {
    result = result.filter((book) => bookMatchesSearch(book, filters.searchTerm));
  }

  if (filters.productLine) {
    // Match on gameLine first: product_lines.name is a short name ("Mage") that is
    // duplicated across oWoD/CoD, while gameLine ("Mage: The Ascension") is unique.
    // Fall back to name so older saved filters/links keep working.
    result = result.filter(
      (book) =>
        book.productLine?.gameLine === filters.productLine ||
        book.productLine?.name === filters.productLine
    );
  }

  if (filters.edition) {
    result = result.filter((book) => book.edition?.name === filters.edition);
  }

  if (filters.year) {
    result = result.filter((book) => book.publicationYear === parseInt(filters.year));
  }

  if (filters.collected === 'collected') {
    result = result.filter((book) => book.collected);
  } else if (filters.collected === 'uncollected') {
    result = result.filter((book) => !book.collected);
  }

  result.sort((a, b) => {
    const aValue = a[sort.key];
    const bValue = b[sort.key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (sort.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return result;
}
