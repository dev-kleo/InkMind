import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Collection, Highlight, Tag } from '@/types';
import { HighlightCard } from '@/features/highlight/HighlightCard';
import { EmptyState } from '@/components/EmptyState';

interface HighlightListProps {
  highlights: Highlight[];
  loading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    patch: Partial<Pick<Highlight, 'color' | 'note' | 'tags' | 'collectionIds'>>,
  ) => void;
  onOpen?: (highlight: Highlight) => void;
  tags?: Tag[];
  collections?: Collection[];
}

export function HighlightList({
  highlights,
  loading,
  onDelete,
  onUpdate,
  onOpen,
  tags = [],
  collections = [],
}: HighlightListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: highlights.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 190,
    overscan: 6,
  });

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <EmptyState
        title="No highlights yet"
        description="Select text on a page and use the floating toolbar, right-click menu, or Ctrl+Shift+H."
      />
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto pr-1">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          const highlight = highlights[item.index]!;
          return (
            <div
              key={highlight.id}
              data-index={item.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full pb-3"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <HighlightCard
                highlight={highlight}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onOpen={onOpen}
                tags={tags}
                collections={collections}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
