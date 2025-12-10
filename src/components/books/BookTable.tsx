'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OwnershipToggle } from './OwnershipToggle';
import { useOptimisticToggle } from '@/hooks/use-optimistic-toggle';
import WorldTabs, { WorldFilter } from './WorldTabs';
import type { BookWithRelations } from '@/lib/db/schema';

interface BookTableProps {
  books: any[];
  productLines: any[];
  editions: any[];
  years: number[];
  initialView?: string;
  worldStats?: Array<{
    world: string | null;
    totalBooks: number;
    collectedBooks: number;
    percentage: number;
  }>;
}

type SortKey = 'title' | 'publicationYear' | 'wwCode' | 'collected';

export default function BookTable({
  books: initialBooks,
  productLines,
  editions,
  years,
  initialView = 'table',
  worldStats,
}: BookTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductLine, setFilterProductLine] = useState('');
  const [filterEdition, setFilterEdition] = useState('');
  const [filterCollected, setFilterCollected] = useState<'all' | 'collected' | 'uncollected'>('all');
  const [worldFilter, setWorldFilter] = useState<WorldFilter>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: 'asc' | 'desc';
  }>({ key: 'title', direction: 'asc' });

  // Use optimistic updates for collected status
  const { books, optimisticToggle } = useOptimisticToggle(initialBooks);

  // Client-side filtering and sorting
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Apply world filter first
    if (worldFilter !== 'all') {
      result = result.filter(
        (book) => book.productLine?.world === worldFilter
      );
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(search) ||
          book.productLine?.name.toLowerCase().includes(search)
      );
    }

    // Apply product line filter
    if (filterProductLine) {
      result = result.filter(
        (book) => book.productLine?.name === filterProductLine
      );
    }

    // Apply edition filter
    if (filterEdition) {
      result = result.filter((book) => book.edition?.name === filterEdition);
    }

    // Apply collected filter
    if (filterCollected === 'collected') {
      result = result.filter((book) => book.collected);
    } else if (filterCollected === 'uncollected') {
      result = result.filter((book) => !book.collected);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [books, searchTerm, filterProductLine, filterEdition, filterCollected, worldFilter, sortConfig]);

  // Sort handler
  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="space-y-4">
      {/* World Tabs */}
      <WorldTabs activeTab={worldFilter} onTabChange={setWorldFilter} stats={worldStats} />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg border">
        <div>
          <label className="text-sm font-medium mb-1 block">Search</label>
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Product Line</label>
          <select
            value={filterProductLine}
            onChange={(e) => setFilterProductLine(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All</option>
            {productLines.map((pl) => (
              <option key={pl.productLineId} value={pl.name}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Edition</label>
          <select
            value={filterEdition}
            onChange={(e) => setFilterEdition(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All</option>
            {editions.map((ed) => (
              <option key={ed.editionId} value={ed.name}>
                {ed.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <select
            value={filterCollected}
            onChange={(e) => setFilterCollected(e.target.value as any)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All</option>
            <option value="collected">Collected</option>
            <option value="uncollected">Not Collected</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedBooks.length} of {books.length} books
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <button
                    onClick={() => handleSort('title')}
                    className="hover:underline"
                  >
                    Title{getSortIcon('title')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Product Line
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Edition
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <button
                    onClick={() => handleSort('publicationYear')}
                    className="hover:underline"
                  >
                    Year{getSortIcon('publicationYear')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <button
                    onClick={() => handleSort('wwCode')}
                    className="hover:underline"
                  >
                    WW Code{getSortIcon('wwCode')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  <button
                    onClick={() => handleSort('collected')}
                    className="hover:underline"
                  >
                    Collected{getSortIcon('collected')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBooks.map((book) => (
                <tr
                  key={book.bookId}
                  className={`border-t transition-colors ${
                    book.collected ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{book.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {book.productLine?.name || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {book.edition?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {book.publicationYear || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">{book.wwCode || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <OwnershipToggle
                      bookId={book.bookId}
                      collected={book.collected}
                      onToggle={optimisticToggle}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No books found matching your filters.
        </div>
      )}
    </div>
  );
}
