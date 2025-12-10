import { useOptimistic } from 'react';

export function useOptimisticToggle<T extends { bookId: number; collected: boolean }>(
  initialBooks: T[]
) {
  const [optimisticBooks, setOptimisticBooks] = useOptimistic(
    initialBooks,
    (state, bookId: number) => {
      return state.map((book) =>
        book.bookId === bookId ? { ...book, collected: !book.collected } : book
      );
    }
  );

  const optimisticToggle = (bookId: number) => {
    setOptimisticBooks(bookId);
  };

  return { books: optimisticBooks, optimisticToggle };
}
