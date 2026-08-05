import { describe, it, expect } from 'vitest';
import { filterAndSortBooks, type FilterState, type SortConfig } from './filter';
import type { BookRow } from '@/lib/db/queries';

function makeBook(overrides: Partial<BookRow> = {}): BookRow {
  return {
    bookId: 1,
    wwCode: 2000,
    title: 'Vampire: The Masquerade',
    publicationYear: 1991,
    isbn10: null,
    isbn13: null,
    pageCount: null,
    collected: false,
    hasPdf: false,
    pdfPath: null,
    authors: null,
    retail: true,
    pod: false,
    seriesName: null,
    dataConfidence: null,
    productLine: {
      productLineId: 1,
      // Mirrors the real DB: `name` is the short name (duplicated across worlds),
      // `gameLine` is the unique full line name.
      name: 'Vampire',
      setting: null,
      abbreviation: 'VTM',
      gameLine: 'Vampire: The Masquerade',
      world: 'oWoD',
    },
    edition: {
      editionId: 1,
      name: '1st Edition',
      sortOrder: 1,
    },
    ...overrides,
  };
}

const defaultFilters: FilterState = {
  searchTerm: '',
  productLine: '',
  edition: '',
  year: '',
  collected: 'all',
  world: 'all',
};

const defaultSort: SortConfig = { key: 'title', direction: 'asc' };

describe('filterAndSortBooks', () => {
  const books: BookRow[] = [
    makeBook({ bookId: 1, title: 'Vampire: The Masquerade', collected: true, publicationYear: 1991, wwCode: 2000, isbn13: '978-1565040298', seriesName: 'Core' }),
    makeBook({
      bookId: 2,
      title: 'Werewolf: The Apocalypse',
      collected: false,
      publicationYear: 1992,
      wwCode: 3000,
      productLine: { productLineId: 2, name: 'Werewolf', setting: null, abbreviation: 'WTA', gameLine: 'Werewolf: The Apocalypse', world: 'oWoD' },
    }),
    makeBook({
      bookId: 3,
      title: 'Vampire: The Requiem',
      collected: false,
      publicationYear: 2004,
      wwCode: 25000,
      productLine: { productLineId: 3, name: 'Vampire', setting: null, abbreviation: 'VTR', gameLine: 'Vampire: The Requiem', world: 'CoD' },
      edition: { editionId: 2, name: '2nd Edition', sortOrder: 2 },
    }),
    makeBook({
      bookId: 4,
      title: 'Guide to the Camarilla',
      collected: false,
      publicationYear: 1999,
      wwCode: 2302,
      seriesName: 'Clanbooks',
      productLine: { productLineId: 1, name: 'Vampire', setting: null, abbreviation: 'VTM', gameLine: 'Vampire: The Masquerade', world: 'oWoD' },
    }),
  ];

  // --- Basic filters (existing) ---

  it('returns all books with default filters', () => {
    const result = filterAndSortBooks(books, defaultFilters, defaultSort);
    expect(result).toHaveLength(4);
  });

  it('filters by search term on title', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'masquerade' }, defaultSort);
    expect(result).toHaveLength(2);
    expect(result.some((b) => b.title === 'Vampire: The Masquerade')).toBe(true);
    expect(result.some((b) => b.title === 'Guide to the Camarilla')).toBe(true);
  });

  it('filters by search term on product line name', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'werewolf' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Werewolf: The Apocalypse');
  });

  it('filters by world - oWoD', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, world: 'oWoD' }, defaultSort);
    expect(result).toHaveLength(3);
    expect(result.every((b) => b.productLine?.world === 'oWoD')).toBe(true);
  });

  it('filters by world - CoD', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, world: 'CoD' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Vampire: The Requiem');
  });

  it('filters by product line', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, productLine: 'Werewolf: The Apocalypse' }, defaultSort);
    expect(result).toHaveLength(1);
  });

  it('filters by edition', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, edition: '2nd Edition' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Vampire: The Requiem');
  });

  it('filters by year', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, year: '1992' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Werewolf: The Apocalypse');
  });

  it('filters by collected status', () => {
    const collected = filterAndSortBooks(books, { ...defaultFilters, collected: 'collected' }, defaultSort);
    expect(collected).toHaveLength(1);
    expect(collected[0].collected).toBe(true);

    const uncollected = filterAndSortBooks(books, { ...defaultFilters, collected: 'uncollected' }, defaultSort);
    expect(uncollected).toHaveLength(3);
  });

  it('combines multiple filters', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, world: 'oWoD', collected: 'uncollected' }, defaultSort);
    expect(result).toHaveLength(2);
  });

  // --- Sorting ---

  it('sorts by title ascending', () => {
    const result = filterAndSortBooks(books, defaultFilters, { key: 'title', direction: 'asc' });
    expect(result[0].title).toBe('Guide to the Camarilla');
    expect(result[3].title).toBe('Werewolf: The Apocalypse');
  });

  it('sorts by title descending', () => {
    const result = filterAndSortBooks(books, defaultFilters, { key: 'title', direction: 'desc' });
    expect(result[0].title).toBe('Werewolf: The Apocalypse');
  });

  it('sorts by publication year', () => {
    const result = filterAndSortBooks(books, defaultFilters, { key: 'publicationYear', direction: 'desc' });
    expect(result[0].publicationYear).toBe(2004);
  });

  it('returns empty array when no books match', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'nonexistent' }, defaultSort);
    expect(result).toHaveLength(0);
  });

  // --- Multi-word search ---

  it('matches all words in a multi-word search', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'vampire masquerade' }, defaultSort);
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.productLine?.gameLine === 'Vampire: The Masquerade')).toBe(true);
  });

  it('multi-word search words can match across different fields', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'camarilla VTM' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Guide to the Camarilla');
  });

  it('multi-word search requires all words to match', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'vampire apocalypse' }, defaultSort);
    expect(result).toHaveLength(0);
  });

  // --- Search across additional fields ---

  it('searches by abbreviation', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'VTR' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Vampire: The Requiem');
  });

  it('searches by WW code', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: '3000' }, defaultSort);
    expect(result).toHaveLength(2);
    expect(result.some((b) => b.title === 'Werewolf: The Apocalypse')).toBe(true);
  });

  it('searches by exact WW code', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: '2302' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Guide to the Camarilla');
  });

  it('searches by ISBN', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: '978-1565040298' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Vampire: The Masquerade');
  });

  it('searches by series name', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'clanbooks' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Guide to the Camarilla');
  });

  it('searches by game line name', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'werewolf' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Werewolf: The Apocalypse');
  });

  // --- Fuzzy/typo tolerance ---

  it('matches with minor typos (1 char off)', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'vampre' }, defaultSort);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((b) => b.title.includes('Vampire'))).toBe(true);
  });

  it('matches with transposed characters', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'camrailla' }, defaultSort);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Guide to the Camarilla');
  });

  it('does not fuzzy match very short queries (3 chars or less)', () => {
    const result = filterAndSortBooks(books, { ...defaultFilters, searchTerm: 'xyz' }, defaultSort);
    expect(result).toHaveLength(0);
  });
});

// --- Regression: product-line filter must disambiguate oWoD vs CoD (real DB shape) ---
// In the real database, product_lines.name is the SHORT name ("Mage") and is
// duplicated across worlds; game_line is the unique one ("Mage: The Ascension"
// vs "Mage: The Awakening"). Filtering on `name` therefore mixes both worlds.
describe('product line filter with real-shaped data', () => {
  const realShaped: BookRow[] = [
    makeBook({
      bookId: 10,
      title: 'The Book of Madness',
      productLine: { productLineId: 99, name: 'Mage', setting: 'WoD', abbreviation: 'MTA', gameLine: 'Mage: The Ascension', world: 'oWoD' },
    }),
    makeBook({
      bookId: 11,
      title: 'The Silver Ladder',
      productLine: { productLineId: 123, name: 'Mage', setting: 'CoD', abbreviation: 'MTAW', gameLine: 'Mage: The Awakening', world: 'CoD' },
    }),
  ];

  it('filters to exactly one game line when both share a short name', () => {
    const result = filterAndSortBooks(
      realShaped,
      { ...defaultFilters, productLine: 'Mage: The Awakening' },
      defaultSort
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('The Silver Ladder');
  });

  it('does not leak Awakening books into an Ascension filter', () => {
    const result = filterAndSortBooks(
      realShaped,
      { ...defaultFilters, productLine: 'Mage: The Ascension' },
      defaultSort
    );
    expect(result).toHaveLength(1);
    expect(result[0].productLine?.world).toBe('oWoD');
  });
});
