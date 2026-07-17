import type { ExportFormat, ExportOptions, Highlight } from '@/types';
import { listHighlights } from '@/services/highlight-service';
import { formatDateTime } from '@/utils/date';

function groupByPage(highlights: Highlight[]): Map<string, Highlight[]> {
  const map = new Map<string, Highlight[]>();
  for (const highlight of highlights) {
    const key = highlight.canonicalUrl || highlight.url;
    const group = map.get(key) ?? [];
    group.push(highlight);
    map.set(key, group);
  }
  return map;
}

function toMarkdown(highlights: Highlight[]): string {
  const groups = groupByPage(highlights);
  const sections: string[] = [];

  for (const [, items] of groups) {
    const first = items[0]!;
    sections.push(`# ${first.pageTitle || 'Untitled'}`);
    sections.push('');
    sections.push(`URL: ${first.url}`);
    sections.push('');
    sections.push(`Date: ${formatDateTime(first.createdAt)}`);
    sections.push('');

    for (const highlight of items) {
      sections.push('## Highlight');
      sections.push('');
      sections.push(highlight.text);
      sections.push('');
      sections.push(`Color: ${highlight.color}`);
      if (highlight.tags.length) {
        sections.push(`Tags: ${highlight.tags.join(', ')}`);
      }
      if (highlight.note.trim()) {
        sections.push('');
        sections.push('### Note');
        sections.push('');
        sections.push(highlight.note.trim());
      }
      sections.push('');
      sections.push(`_Saved ${formatDateTime(highlight.createdAt)}_`);
      sections.push('');
      sections.push('---');
      sections.push('');
    }
  }

  return sections.join('\n').trim() + '\n';
}

function toText(highlights: Highlight[]): string {
  return highlights
    .map((highlight) => {
      const parts = [
        highlight.pageTitle,
        highlight.url,
        highlight.text,
        highlight.note ? `Note: ${highlight.note}` : '',
        highlight.tags.length ? `Tags: ${highlight.tags.join(', ')}` : '',
        `Saved: ${formatDateTime(highlight.createdAt)}`,
        '-----',
      ];
      return parts.filter(Boolean).join('\n');
    })
    .join('\n\n');
}

function toJson(highlights: Highlight[]): string {
  return `${JSON.stringify(highlights, null, 2)}\n`;
}

export async function exportHighlights(options: ExportOptions): Promise<{
  content: string;
  filename: string;
  mimeType: string;
}> {
  let highlights = await listHighlights({
    pageUrl: options.url ?? null,
    collectionId: options.collectionId ?? null,
    query: '',
    colors: [],
    tags: [],
    hasNote: null,
  });

  if (options.highlightIds?.length) {
    const set = new Set(options.highlightIds);
    highlights = highlights.filter((item) => set.has(item.id));
  }

  const format: ExportFormat = options.format;
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    return {
      content: toJson(highlights),
      filename: `knowledge-os-export-${stamp}.json`,
      mimeType: 'application/json',
    };
  }

  if (format === 'text') {
    return {
      content: toText(highlights),
      filename: `knowledge-os-export-${stamp}.txt`,
      mimeType: 'text/plain',
    };
  }

  return {
    content: toMarkdown(highlights),
    filename: `knowledge-os-export-${stamp}.md`,
    mimeType: 'text/markdown',
  };
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportAndDownload(options: ExportOptions): Promise<void> {
  const file = await exportHighlights(options);
  downloadTextFile(file.filename, file.content, file.mimeType);
}
