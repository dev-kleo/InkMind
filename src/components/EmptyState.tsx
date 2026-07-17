import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-muted/60 px-4 py-10 text-center animate-fade-up">
      <h3 className="font-display text-base text-ink">{title}</h3>
      <p className="max-w-xs text-sm text-ink-muted">{description}</p>
      {action}
    </div>
  );
}
