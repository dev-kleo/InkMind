import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search highlights, notes, titles…',
  autoFocus,
}: SearchInputProps) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      <input
        className="kos-input pl-9 pr-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search"
      />
      {value ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ink-subtle hover:bg-surface-muted hover:text-ink"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </label>
  );
}
