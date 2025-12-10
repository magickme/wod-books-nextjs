'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { books } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// Toggle collected status for a single book
export async function toggleBookCollected(bookId: number) {
  try {
    // Get current status
    const book = await db
      .select({ collected: books.collected })
      .from(books)
      .where(eq(books.bookId, bookId))
      .limit(1);

    if (!book[0]) {
      return { success: false, error: 'Book not found' };
    }

    // Toggle the status
    const newStatus = !book[0].collected;

    await db
      .update(books)
      .set({
        collected: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(books.bookId, bookId));

    // Revalidate the books page to reflect changes
    revalidatePath('/books');
    revalidatePath('/');

    return {
      success: true,
      collected: newStatus,
      message: newStatus ? 'Book marked as collected' : 'Book unmarked',
    };
  } catch (error) {
    console.error('Error toggling book collection:', error);
    return { success: false, error: 'Failed to update book' };
  }
}

// Bulk update collected status
export async function bulkUpdateCollected(bookIds: number[], collected: boolean) {
  try {
    // Use PostgreSQL's ANY operator for efficient bulk update
    await db
      .update(books)
      .set({
        collected,
        updatedAt: new Date(),
      })
      .where(sql`${books.bookId} = ANY(${bookIds})`);

    revalidatePath('/books');
    revalidatePath('/');

    return {
      success: true,
      count: bookIds.length,
      message: `${bookIds.length} book(s) updated`,
    };
  } catch (error) {
    console.error('Error bulk updating books:', error);
    return { success: false, error: 'Failed to update books' };
  }
}

// Update book details (for admin/detail page)
export async function updateBook(
  bookId: number,
  data: Partial<typeof books.$inferInsert>
) {
  try {
    await db
      .update(books)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(books.bookId, bookId));

    revalidatePath(`/books/${bookId}`);
    revalidatePath('/books');

    return { success: true };
  } catch (error) {
    console.error('Error updating book:', error);
    return { success: false, error: 'Failed to update book' };
  }
}
