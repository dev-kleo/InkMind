import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Tag } from '@/types';

interface TagsPanelProps {
  tags: Tag[];
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TagsPanel({ tags, onCreate, onDelete }: TagsPanelProps) {
  const [name, setName] = useState('');

  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          void onCreate(name.trim()).then(() => setName(''));
        }}
      >
        <input
          className="kos-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New tag name"
          aria-label="New tag name"
        />
        <button type="submit" className="kos-btn-primary shrink-0" aria-label="Create tag">
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <ul className="space-y-2">
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="flex items-center justify-between rounded-xl border border-line bg-surface-elevated px-3 py-2"
          >
            <span className="inline-flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
            <button
              type="button"
              className="kos-btn-ghost !p-2"
              aria-label={`Delete ${tag.name}`}
              onClick={() => void onDelete(tag.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
