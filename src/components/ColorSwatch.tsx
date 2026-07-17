import type { HighlightColor } from '@/types';
import { HIGHLIGHT_COLORS } from '@/utils/constants';
import { cn } from '@/utils/cn';

interface ColorSwatchProps {
  color: HighlightColor;
  selected?: boolean;
  onSelect?: (color: HighlightColor) => void;
  size?: 'sm' | 'md';
}

export function ColorSwatch({ color, selected, onSelect, size = 'md' }: ColorSwatchProps) {
  const palette = HIGHLIGHT_COLORS[color];
  return (
    <button
      type="button"
      title={palette.label}
      aria-label={`Select ${palette.label}`}
      aria-pressed={selected}
      onClick={() => onSelect?.(color)}
      className={cn(
        'rounded-full border border-black/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
        selected && 'ring-2 ring-offset-2 ring-brand-500 ring-offset-surface',
      )}
      style={{ backgroundColor: palette.bg }}
    />
  );
}
