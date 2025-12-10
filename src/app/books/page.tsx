import { Suspense } from 'react';
import {
  getAllBooks,
  getProductLines,
  getEditions,
  getPublicationYears,
  getCompletionStats,
  getOverallStats,
  getStatsByWorld,
} from '@/lib/db/queries';
import BookTable from '@/components/books/BookTable';
import CompletionSidebar from '@/components/collections/CompletionSidebar';
import WorldTabs from '@/components/books/WorldTabs';

export const dynamic = 'force-dynamic'; // Disable caching for real-time updates

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; productLine?: string; edition?: string; year?: string }>;
}) {
  const params = await searchParams;

  // Parallel data fetching (all requests fire simultaneously)
  const [books, productLines, editions, years, completionStats, overallStats, worldStats] =
    await Promise.all([
      getAllBooks(),
      getProductLines(),
      getEditions(),
      getPublicationYears(),
      getCompletionStats(),
      getOverallStats(),
      getStatsByWorld(),
    ]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex gap-8">
        {/* Main content area */}
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-4xl font-bold mb-2">Book Collection</h2>
            <p className="text-muted-foreground">
              Browse and manage your World of Darkness book collection
            </p>
          </div>

          <div className="mb-4 p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Progress</p>
                <p className="text-2xl font-bold">
                  {overallStats.collectedBooks} / {overallStats.totalBooks} books
                </p>
              </div>
              <div className="text-4xl font-bold text-primary">
                {overallStats.percentage}%
              </div>
            </div>
          </div>

          <Suspense fallback={<div>Loading books...</div>}>
            <BookTable
              books={books}
              productLines={productLines}
              editions={editions}
              years={years}
              initialView={params.view || 'table'}
              worldStats={worldStats}
            />
          </Suspense>
        </div>

        {/* Completion sidebar */}
        <aside className="w-80 sticky top-8 h-fit">
          <CompletionSidebar stats={completionStats} worldStats={worldStats} />
        </aside>
      </div>
    </div>
  );
}
