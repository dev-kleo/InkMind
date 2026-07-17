import type { Collection, Highlight, Tag } from '@/types';

interface HighlightMetaEditorProps {
  highlight: Highlight;
  tags: Tag[];
  collections: Collection[];
  onUpdate: (
    id: string,
    patch: Partial<Pick<Highlight, 'tags' | 'collectionIds'>>,
  ) => void;
}

export function HighlightMetaEditor({
  highlight,
  tags,
  collections,
  onUpdate,
}: HighlightMetaEditorProps) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      <label>
        <span className="kos-label">Tags</span>
        <select
          className="kos-input"
          multiple
          size={3}
          value={highlight.tags}
          onChange={(event) => {
            const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
            onUpdate(highlight.id, { tags: selected });
          }}
          aria-label="Assign tags"
        >
          {tags.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="kos-label">Collections</span>
        <select
          className="kos-input"
          multiple
          size={3}
          value={highlight.collectionIds}
          onChange={(event) => {
            const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
            onUpdate(highlight.id, { collectionIds: selected });
          }}
          aria-label="Assign collections"
        >
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
