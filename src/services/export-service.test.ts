import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/storage/database';
import { createHighlight } from '@/services/highlight-service';
import { exportHighlights } from '@/services/export-service';
import { ensureSeedData } from '@/storage/seed';

describe('exportHighlights', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await ensureSeedData();
  });

  it('exports markdown with title, url, highlight, and note', async () => {
    await createHighlight({
      text: 'Selected text...',
      note: 'My thoughts...',
      url: 'https://example.com/article',
      pageTitle: 'Article Title',
      color: 'yellow',
    });

    const file = await exportHighlights({ format: 'markdown' });
    expect(file.filename).toMatch(/\.md$/);
    expect(file.content).toContain('# Article Title');
    expect(file.content).toContain('URL: https://example.com/article');
    expect(file.content).toContain('## Highlight');
    expect(file.content).toContain('Selected text...');
    expect(file.content).toContain('### Note');
    expect(file.content).toContain('My thoughts...');
  });

  it('exports json arrays', async () => {
    await createHighlight({
      text: 'Hello',
      url: 'https://example.com',
      pageTitle: 'Hello page',
    });
    const file = await exportHighlights({ format: 'json' });
    const parsed = JSON.parse(file.content) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });
});
