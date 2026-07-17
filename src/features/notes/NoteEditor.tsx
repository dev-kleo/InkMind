import { useEffect, useState } from 'react';
import { NOTE_MAX_CHARS } from '@/utils/constants';
import { cn } from '@/utils/cn';

interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  autoFocus?: boolean;
  compact?: boolean;
}

export function NoteEditor({
  value,
  onChange,
  onSave,
  autoFocus,
  compact,
}: NoteEditorProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <textarea
        className={cn('kos-input min-h-[120px] resize-y font-mono text-[13px]', compact && 'min-h-[88px]')}
        value={local}
        maxLength={NOTE_MAX_CHARS}
        autoFocus={autoFocus}
        placeholder="Write a markdown note…"
        aria-label="Note"
        onChange={(event) => {
          setLocal(event.target.value);
          onChange(event.target.value);
        }}
        onBlur={() => onSave?.(local)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            onSave?.(local);
          }
        }}
      />
      <div className="flex items-center justify-between text-xs text-ink-subtle">
        <span>Markdown supported</span>
        <span>
          {local.length} / {NOTE_MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
