import { memo, useState } from 'react';
import { ExternalLink, StickyNote, Tag, Trash2 } from 'lucide-react';
import type { Collection, Highlight, HighlightColor, Tag as TagType } from '@/types';
import { ColorSwatch } from '@/components/ColorSwatch';
import { NoteEditor } from '@/features/notes/NoteEditor';
import { HighlightMetaEditor } from '@/features/highlight/HighlightMetaEditor';
import { HIGHLIGHT_COLOR_LIST, HIGHLIGHT_COLORS } from '@/utils/constants';
import { formatRelativeTime } from '@/utils/date';
import { displayHost } from '@/utils/url';
import { cn } from '@/utils/cn';

interface HighlightCardProps {
  highlight: Highlight;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    patch: Partial<Pick<Highlight, 'color' | 'note' | 'tags' | 'collectionIds'>>,
  ) => void;
  onOpen?: (highlight: Highlight) => void;
  compact?: boolean;
  tags?: TagType[];
  collections?: Collection[];
}

function HighlightCardComponent({
  highlight,
  onDelete,
  onUpdate,
  onOpen,
  compact,
  tags = [],
  collections = [],
}: HighlightCardProps) {
  const [editingNote, setEditingNote] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const palette = HIGHLIGHT_COLORS[highlight.color];

  return (
    <article className="kos-card-interactive animate-fade-up">
      <div className="mb-2 flex items-start justify-between gap-2">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpen?.(highlight)}
        >
          <p className="truncate text-xs font-medium text-ink-subtle">
            {highlight.pageTitle || displayHost(highlight.url)}
          </p>
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink">
            <span
              className="rounded px-0.5"
              style={{ backgroundColor: palette.bg }}
            >
              {highlight.text}
            </span>
          </p>
        </button>
        <button
          type="button"
          className="kos-btn-ghost shrink-0 !p-2"
          aria-label="Delete highlight"
          onClick={() => onDelete(highlight.id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {HIGHLIGHT_COLOR_LIST.map((color) => (
          <ColorSwatch
            key={color}
            color={color}
            size="sm"
            selected={highlight.color === color}
            onSelect={(next: HighlightColor) => onUpdate(highlight.id, { color: next })}
          />
        ))}
      </div>

      {highlight.tags.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {highlight.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {!compact && editingNote ? (
        <NoteEditor
          value={highlight.note}
          compact
          autoFocus
          onChange={() => undefined}
          onSave={(note) => {
            onUpdate(highlight.id, { note });
            setEditingNote(false);
          }}
        />
      ) : (
        <button
          type="button"
          className={cn(
            'flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-surface-muted',
            !highlight.note && 'text-ink-subtle',
          )}
          onClick={() => setEditingNote(true)}
        >
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="whitespace-pre-wrap">
            {highlight.note || 'Add a note…'}
          </span>
        </button>
      )}

      {!compact ? (
        <div className="mt-2">
          <button
            type="button"
            className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
            onClick={() => setEditingMeta((value) => !value)}
          >
            {editingMeta ? 'Hide tags & collections' : 'Edit tags & collections'}
          </button>
          {editingMeta ? (
            <HighlightMetaEditor
              highlight={highlight}
              tags={tags}
              collections={collections}
              onUpdate={onUpdate}
            />
          ) : null}
        </div>
      ) : null}

      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-subtle">
        <span>{formatRelativeTime(highlight.createdAt)}</span>
        <a
          href={highlight.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-ink"
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </div>
    </article>
  );
}

export const HighlightCard = memo(HighlightCardComponent);
