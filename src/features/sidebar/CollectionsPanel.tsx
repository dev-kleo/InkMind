import { useState } from 'react';
import { FolderPlus, Trash2 } from 'lucide-react';
import type { Collection } from '@/types';

interface CollectionsPanelProps {
  collections: Collection[];
  onCreate: (name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CollectionsPanel({
  collections,
  onCreate,
  onDelete,
}: CollectionsPanelProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="space-y-3">
      <form
        className="space-y-2 rounded-2xl border border-line bg-surface-elevated p-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          void onCreate(name.trim(), description.trim()).then(() => {
            setName('');
            setDescription('');
          });
        }}
      >
        <input
          className="kos-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Collection name"
          aria-label="Collection name"
        />
        <input
          className="kos-input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short description"
          aria-label="Collection description"
        />
        <button type="submit" className="kos-btn-primary w-full">
          <FolderPlus className="h-4 w-4" />
          Create collection
        </button>
      </form>

      <ul className="space-y-2">
        {collections.map((collection) => (
          <li
            key={collection.id}
            className="rounded-xl border border-line bg-surface-elevated px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">{collection.name}</p>
                {collection.description ? (
                  <p className="mt-1 text-xs text-ink-muted">{collection.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="kos-btn-ghost !p-2"
                aria-label={`Delete ${collection.name}`}
                onClick={() => void onDelete(collection.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
