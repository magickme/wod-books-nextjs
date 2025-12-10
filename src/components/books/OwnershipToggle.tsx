'use client';

import { useTransition } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleBookCollected } from '@/lib/actions/books';
import { toast } from 'sonner';

interface OwnershipToggleProps {
  bookId: number;
  collected: boolean;
  onToggle: (bookId: number) => void;
}

export function OwnershipToggle({
  bookId,
  collected,
  onToggle,
}: OwnershipToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic UI update
    onToggle(bookId);

    // Server action
    startTransition(async () => {
      const result = await toggleBookCollected(bookId);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to update');
        // Revert optimistic update on error
        onToggle(bookId);
      }
    });
  };

  return (
    <Checkbox
      checked={collected}
      onCheckedChange={handleToggle}
      disabled={isPending}
      className="transition-transform hover:scale-110"
    />
  );
}
