import type { Tag } from '@/types';
import { db } from '@/storage/database';
import { ensureSeedData } from '@/storage/seed';
import { createId } from '@/utils/id';

const TAG_PALETTE = ['#0ea5e9', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#64748b', '#ec4899'];

export async function listTags(): Promise<Tag[]> {
  await ensureSeedData();
  return db.tags.orderBy('name').toArray();
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Tag name is required');

  const existing = await db.tags.filter((tag) => tag.name.toLowerCase() === trimmed.toLowerCase()).first();
  if (existing) return existing;

  const count = await db.tags.count();
  const tag: Tag = {
    id: createId('tag'),
    name: trimmed,
    color: color ?? TAG_PALETTE[count % TAG_PALETTE.length]!,
    createdAt: Date.now(),
  };
  await db.tags.add(tag);
  return tag;
}

export async function deleteTag(id: string): Promise<void> {
  const tag = await db.tags.get(id);
  if (!tag) return;

  await db.transaction('rw', db.tags, db.highlights, async () => {
    await db.tags.delete(id);
    const highlights = await db.highlights.filter((h) => h.tags.includes(tag.name)).toArray();
    await Promise.all(
      highlights.map((highlight) =>
        db.highlights.update(highlight.id, {
          tags: highlight.tags.filter((name) => name !== tag.name),
          updatedAt: Date.now(),
        }),
      ),
    );
  });
}

export async function renameTag(id: string, name: string): Promise<Tag | undefined> {
  const tag = await db.tags.get(id);
  if (!tag) return undefined;
  const trimmed = name.trim();
  if (!trimmed) return tag;

  await db.transaction('rw', db.tags, db.highlights, async () => {
    await db.tags.update(id, { name: trimmed });
    const highlights = await db.highlights.filter((h) => h.tags.includes(tag.name)).toArray();
    await Promise.all(
      highlights.map((highlight) =>
        db.highlights.update(highlight.id, {
          tags: highlight.tags.map((n) => (n === tag.name ? trimmed : n)),
          updatedAt: Date.now(),
        }),
      ),
    );
  });

  return db.tags.get(id);
}
