import type {
  CreateHighlightInput,
  Highlight,
  HighlightColor,
  HighlightFilters,
} from '@/types';
import { db } from '@/storage/database';
import { ensureSeedData } from '@/storage/seed';
import { createId } from '@/utils/id';
import { canonicalUrl } from '@/utils/url';
import { getSettings } from '@/services/settings-service';

function matchesQuery(highlight: Highlight, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    highlight.text.toLowerCase().includes(q) ||
    highlight.note.toLowerCase().includes(q) ||
    highlight.pageTitle.toLowerCase().includes(q) ||
    highlight.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export async function createHighlight(input: CreateHighlightInput): Promise<Highlight> {
  await ensureSeedData();
  const settings = await getSettings();
  const now = Date.now();
  const url = input.url ?? (typeof location !== 'undefined' ? location.href : '');
  const pageTitle =
    input.pageTitle ?? (typeof document !== 'undefined' ? document.title : 'Untitled');

  const highlight: Highlight = {
    id: createId('hl'),
    url,
    canonicalUrl: canonicalUrl(url),
    pageTitle,
    text: input.text.trim(),
    color: input.color ?? settings.defaultHighlightColor,
    locator: input.locator ?? null,
    note: input.note ?? '',
    tags: input.tags ?? [],
    collectionIds: input.collectionIds ?? [],
    createdAt: now,
    updatedAt: now,
    pageType: input.pageType ?? 'webpage',
    pdfPageNumber: input.pdfPageNumber,
    pdfRects: input.pdfRects,
  };

  await db.highlights.add(highlight);
  return highlight;
}

export async function updateHighlight(
  id: string,
  patch: Partial<
    Pick<
      Highlight,
      | 'color'
      | 'note'
      | 'tags'
      | 'collectionIds'
      | 'text'
      | 'pageTitle'
      | 'pdfRects'
      | 'locator'
    >
  >,
): Promise<Highlight | undefined> {
  const existing = await db.highlights.get(id);
  if (!existing) return undefined;

  const next: Highlight = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  await db.highlights.put(next);
  return next;
}

export async function deleteHighlight(id: string): Promise<void> {
  await db.highlights.delete(id);
}

export async function getHighlight(id: string): Promise<Highlight | undefined> {
  return db.highlights.get(id);
}

export async function listHighlights(filters: Partial<HighlightFilters> = {}): Promise<Highlight[]> {
  await ensureSeedData();
  let items = await db.highlights.orderBy('createdAt').reverse().toArray();

  if (filters.pageUrl) {
    const key = canonicalUrl(filters.pageUrl);
    items = items.filter((item) => item.canonicalUrl === key || item.url === filters.pageUrl);
  }

  if (filters.colors && filters.colors.length > 0) {
    const set = new Set(filters.colors);
    items = items.filter((item) => set.has(item.color));
  }

  if (filters.tags && filters.tags.length > 0) {
    items = items.filter((item) => filters.tags!.some((tag) => item.tags.includes(tag)));
  }

  if (filters.collectionId) {
    items = items.filter((item) => item.collectionIds.includes(filters.collectionId!));
  }

  if (filters.hasNote === true) {
    items = items.filter((item) => item.note.trim().length > 0);
  } else if (filters.hasNote === false) {
    items = items.filter((item) => item.note.trim().length === 0);
  }

  if (filters.query) {
    items = items.filter((item) => matchesQuery(item, filters.query!));
  }

  return items;
}

export async function getHighlightsForUrl(url: string): Promise<Highlight[]> {
  return listHighlights({ pageUrl: url });
}

export async function getTodayHighlights(): Promise<Highlight[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startTs = start.getTime();
  return db.highlights.where('createdAt').aboveOrEqual(startTs).reverse().toArray();
}

export async function getRecentHighlights(limit = 20): Promise<Highlight[]> {
  return db.highlights.orderBy('createdAt').reverse().limit(limit).toArray();
}

export async function setHighlightColor(id: string, color: HighlightColor): Promise<Highlight | undefined> {
  return updateHighlight(id, { color });
}

export async function setHighlightNote(id: string, note: string): Promise<Highlight | undefined> {
  return updateHighlight(id, { note });
}
