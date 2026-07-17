import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/storage/database';
import { ensureSeedData } from '@/storage/seed';
import {
  createHighlight,
  listHighlights,
  updateHighlight,
} from '@/services/highlight-service';

describe('highlight-service', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await ensureSeedData();
  });

  it('creates and searches highlights across text, notes, and titles', async () => {
    await createHighlight({
      text: 'Neural networks',
      note: 'Useful for exams',
      url: 'https://example.com/ml',
      pageTitle: 'Deep Learning 101',
      tags: ['Exam'],
    });

    await createHighlight({
      text: 'Budgeting tips',
      note: 'Save more',
      url: 'https://example.com/finance',
      pageTitle: 'Personal Finance',
    });

    const byNote = await listHighlights({ query: 'exams' });
    expect(byNote).toHaveLength(1);
    expect(byNote[0]?.text).toBe('Neural networks');

    const byTitle = await listHighlights({ query: 'finance' });
    expect(byTitle).toHaveLength(1);
  });

  it('updates notes and colors', async () => {
    const created = await createHighlight({
      text: 'Quote',
      url: 'https://example.com',
      pageTitle: 'Page',
    });

    const updated = await updateHighlight(created.id, {
      note: 'Updated note',
      color: 'blue',
    });

    expect(updated?.note).toBe('Updated note');
    expect(updated?.color).toBe('blue');
  });
});
