import type { Collection, HighlightColor, HighlightFilters, Tag } from '@/types';
import { ColorSwatch } from '@/components/ColorSwatch';
import { HIGHLIGHT_COLOR_LIST } from '@/utils/constants';

interface FilterBarProps {
  filters: HighlightFilters;
  tags: Tag[];
  collections: Collection[];
  onChange: (patch: Partial<HighlightFilters>) => void;
}

export function FilterBar({ filters, tags, collections, onChange }: FilterBarProps) {
  const toggleColor = (color: HighlightColor) => {
    const exists = filters.colors.includes(color);
    onChange({
      colors: exists ? filters.colors.filter((c) => c !== color) : [...filters.colors, color],
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface-elevated p-3">
      <div>
        <p className="kos-label">Colors</p>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHT_COLOR_LIST.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              selected={filters.colors.includes(color)}
              onSelect={toggleColor}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="kos-label">Tag</span>
          <select
            className="kos-input"
            value={filters.tags[0] ?? ''}
            onChange={(event) =>
              onChange({ tags: event.target.value ? [event.target.value] : [] })
            }
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="kos-label">Collection</span>
          <select
            className="kos-input"
            value={filters.collectionId ?? ''}
            onChange={(event) =>
              onChange({ collectionId: event.target.value || null })
            }
          >
            <option value="">All collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          className="rounded border-line"
          checked={filters.hasNote === true}
          onChange={(event) =>
            onChange({ hasNote: event.target.checked ? true : null })
          }
        />
        Only with notes
      </label>
    </div>
  );
}
