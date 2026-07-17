import { useState } from 'react';
import { Download } from 'lucide-react';
import type { ExportFormat } from '@/types';
import { exportAndDownload } from '@/services/export-service';

interface ExportPanelProps {
  pageUrl: string | null;
  collectionId: string | null;
  defaultFormat: ExportFormat;
}

export function ExportPanel({ pageUrl, collectionId, defaultFormat }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [scope, setScope] = useState<'all' | 'page' | 'collection'>('page');
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface-elevated p-3">
      <label>
        <span className="kos-label">Format</span>
        <select
          className="kos-input"
          value={format}
          onChange={(event) => setFormat(event.target.value as ExportFormat)}
        >
          <option value="markdown">Markdown</option>
          <option value="json">JSON</option>
          <option value="text">Plain text</option>
        </select>
      </label>

      <label>
        <span className="kos-label">Scope</span>
        <select
          className="kos-input"
          value={scope}
          onChange={(event) => setScope(event.target.value as typeof scope)}
        >
          <option value="page">Current page</option>
          <option value="collection">Current collection filter</option>
          <option value="all">All highlights</option>
        </select>
      </label>

      <button
        type="button"
        className="kos-btn-primary w-full"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void exportAndDownload({
            format,
            url: scope === 'page' ? pageUrl ?? undefined : undefined,
            collectionId: scope === 'collection' ? collectionId : null,
          }).finally(() => setBusy(false));
        }}
      >
        <Download className="h-4 w-4" />
        {busy ? 'Exporting…' : 'Export'}
      </button>
    </div>
  );
}
