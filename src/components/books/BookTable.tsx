'use client';

import { useState, useMemo, useRef, useCallback, Fragment } from 'react';
import { useQueryState, parseAsString, parseAsStringEnum } from 'nuqs';
import { Search, X, ChevronDown, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OwnershipToggle } from './OwnershipToggle';
import { useOptimisticToggle } from '@/hooks/use-optimistic-toggle';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import WorldTabs from './WorldTabs';
import BookCard from './BookCard';
import BulkActionBar from './BulkActionBar';
import { filterAndSortBooks, type WorldFilter, type CollectedFilter, type SortKey, type SortConfig } from '@/lib/utils/filter';
import type { BookRow, ProductLineRow, EditionRow, WorldStatRow } from '@/lib/db/queries';

interface BookTableProps {
  books: BookRow[];
  productLines: ProductLineRow[];
  editions: EditionRow[];
  years: number[];
  worldStats?: WorldStatRow[];
}

export default function BookTable({
  books: initialBooks,
  productLines,
  editions,
  years,
  worldStats,
}: BookTableProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useQueryState('q', parseAsString.withDefault(''));
  const [filterProductLine, setFilterProductLine] = useQueryState('line', parseAsString.withDefault(''));
  const [filterEdition, setFilterEdition] = useQueryState('edition', parseAsString.withDefault(''));
  const [filterYear, setFilterYear] = useQueryState('year', parseAsString.withDefault(''));
  const [filterCollected, setFilterCollected] = useQueryState(
    'status',
    parseAsStringEnum(['all', 'collected', 'uncollected'] as const).withDefault('all')
  );
  const [worldFilter, setWorldFilter] = useQueryState(
    'world',
    parseAsStringEnum(['all', 'oWoD', 'CoD'] as const).withDefault('all')
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'asc' });
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const { books, optimisticToggle } = useOptimisticToggle(initialBooks);

  const filteredAndSortedBooks = useMemo(
    () =>
      filterAndSortBooks(
        books,
        {
          searchTerm,
          productLine: filterProductLine,
          edition: filterEdition,
          year: filterYear,
          collected: filterCollected as CollectedFilter,
          world: worldFilter as WorldFilter,
        },
        sortConfig
      ),
    [books, searchTerm, filterProductLine, filterEdition, filterYear, filterCollected, worldFilter, sortConfig]
  );

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

  const hasActiveFilters = searchTerm || filterProductLine || filterEdition || filterYear || filterCollected !== 'all' || worldFilter !== 'all';

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterProductLine('');
    setFilterEdition('');
    setFilterYear('');
    setFilterCollected('all');
    setWorldFilter('all');
  };

  const toggleSelect = (bookId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredAndSortedBooks.map((b) => b.bookId)));
  };

  const handleBulkComplete = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  useKeyboardShortcuts({
    onFocusSearch: useCallback(() => searchRef.current?.focus(), []),
    onNextBook: useCallback(() => {
      setFocusedIndex((i) => Math.min(i + 1, filteredAndSortedBooks.length - 1));
    }, [filteredAndSortedBooks.length]),
    onPrevBook: useCallback(() => {
      setFocusedIndex((i) => Math.max(i - 1, 0));
    }, []),
    onToggleCurrent: useCallback(() => {
      if (focusedIndex >= 0 && focusedIndex < filteredAndSortedBooks.length) {
        optimisticToggle(filteredAndSortedBooks[focusedIndex].bookId);
      }
    }, [focusedIndex, filteredAndSortedBooks, optimisticToggle]),
    onEscape: useCallback(() => {
      setExpandedBookId(null);
      setSelectMode(false);
      setSelectedIds(new Set());
      setFocusedIndex(-1);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }, []),
  });

  return (
    <div className="space-y-4">
      <WorldTabs activeTab={worldFilter as WorldFilter} onTabChange={(tab) => setWorldFilter(tab)} stats={worldStats} />

      {/* Filters */}
      <div className="space-y-3 p-4 bg-card rounded-lg border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search books or product lines... (press /)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterProductLine}
            onChange={(e) => setFilterProductLine(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="">All Lines</option>
            {productLines.map((pl) => (
              <option key={pl.productLineId} value={pl.gameLine ?? pl.name}>
                {pl.gameLine ?? pl.name}
              </option>
            ))}
          </select>
          <select
            value={filterEdition}
            onChange={(e) => setFilterEdition(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="">All Editions</option>
            {editions.map((ed) => (
              <option key={ed.editionId} value={ed.name}>{ed.name}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
          <select
            value={filterCollected}
            onChange={(e) => setFilterCollected(e.target.value as CollectedFilter)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="all">All Status</option>
            <option value="collected">Collected</option>
            <option value="uncollected">Not Collected</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={selectMode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
              className="h-8 text-xs"
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Select
            </Button>
            <span className="text-xs text-muted-foreground">
              {filteredAndSortedBooks.length} of {books.length}
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {selectMode && (
                  <th className="px-3 py-3 w-8">
                    <Checkbox
                      checked={selectedIds.size === filteredAndSortedBooks.length && filteredAndSortedBooks.length > 0}
                      onCheckedChange={(checked) => checked ? selectAllVisible() : setSelectedIds(new Set())}
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <button onClick={() => handleSort('title')} className="hover:underline">
                    Title{getSortIcon('title')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Product Line</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Edition</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <button onClick={() => handleSort('publicationYear')} className="hover:underline">
                    Year{getSortIcon('publicationYear')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <button onClick={() => handleSort('wwCode')} className="hover:underline">
                    WW Code{getSortIcon('wwCode')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  <button onClick={() => handleSort('collected')} className="hover:underline">
                    Collected{getSortIcon('collected')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBooks.map((book, index) => {
                const collected = book.collected ?? false;
                const isExpanded = expandedBookId === book.bookId;
                const isFocused = focusedIndex === index;
                return (
                  <Fragment key={book.bookId}>
                    <tr
                      className={`border-t transition-colors cursor-pointer ${
                        isFocused ? 'ring-1 ring-inset ring-primary/50' : ''
                      } ${
                        collected ? 'bg-primary/5' : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                      onClick={() => !selectMode && setExpandedBookId(isExpanded ? null : book.bookId)}
                    >
                      {selectMode && (
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(book.bookId)}
                            onCheckedChange={() => toggleSelect(book.bookId)}
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {!selectMode && (
                            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          )}
                          <span className={`font-medium ${collected ? 'text-foreground' : ''}`}>{book.title}</span>
                          {book.hasPdf && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[10px] px-1 py-0 leading-4"
                              title="A PDF of this book is in the local library (not physical ownership)"
                            >
                              PDF
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {book.productLine?.gameLine || book.productLine?.name || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{book.edition?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{book.publicationYear || '-'}</td>
                      <td className="px-4 py-3 text-sm">{book.wwCode || '-'}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <OwnershipToggle bookId={book.bookId} collected={collected} onToggle={optimisticToggle} />
                      </td>
                    </tr>
                    {isExpanded && !selectMode && (
                      <tr key={`${book.bookId}-detail`} className="border-t bg-muted/30">
                        <td colSpan={selectMode ? 8 : 7} className="px-4 py-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground ml-5">
                            {book.isbn10 && <div><span className="font-medium">ISBN-10:</span> {book.isbn10}</div>}
                            {book.isbn13 && <div><span className="font-medium">ISBN-13:</span> {book.isbn13}</div>}
                            {book.pageCount && <div><span className="font-medium">Pages:</span> {book.pageCount}</div>}
                            {book.seriesName && <div><span className="font-medium">Series:</span> {book.seriesName}</div>}
                            {book.wwCode && <div><span className="font-medium">WW Code:</span> {book.wwCode}</div>}
                            {book.retail && <div>Retail edition</div>}
                            {book.pod && <div>Print on Demand</div>}
                            {book.authors && (
                              <div className="col-span-2 md:col-span-4">
                                <span className="font-medium">Authors:</span> {book.authors}
                              </div>
                            )}
                            {book.hasPdf && book.pdfPath && (
                              <div className="col-span-2 md:col-span-4 break-all">
                                <span className="font-medium">PDF:</span>{' '}
                                <span title={book.pdfPath}>{book.pdfPath.replace(/^.*\//, '')}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2">
        {filteredAndSortedBooks.map((book) => (
          <BookCard key={book.bookId} book={book} onToggle={optimisticToggle} />
        ))}
      </div>

      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-lg font-nwod text-muted-foreground">No tomes found</p>
          <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Keyboard shortcut hints */}
      <div className="hidden lg:flex justify-center gap-4 text-xs text-muted-foreground/50 pt-2">
        <span><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground">/</kbd> search</span>
        <span><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground">j</kbd>/<kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground">k</kbd> navigate</span>
        <span><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground">Enter</kbd> toggle</span>
        <span><kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground">Esc</kbd> clear</span>
      </div>

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        selectedIds={Array.from(selectedIds)}
        onComplete={handleBulkComplete}
        onCancel={() => { setSelectMode(false); setSelectedIds(new Set()); }}
      />
    </div>
  );
}
