import type { Collection } from '@/types';
import { db } from '@/storage/database';
import { ensureSeedData } from '@/storage/seed';
import { createId } from '@/utils/id';

export async function listCollections(): Promise<Collection[]> {
  await ensureSeedData();
  return db.collections.orderBy('name').toArray();
}

export async function createCollection(name: string, description = ''): Promise<Collection> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Collection name is required');

  const now = Date.now();
  const collection: Collection = {
    id: createId('col'),
    name: trimmed,
    description: description.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await db.collections.add(collection);
  return collection;
}

export async function updateCollection(
  id: string,
  patch: Partial<Pick<Collection, 'name' | 'description'>>,
): Promise<Collection | undefined> {
  const existing = await db.collections.get(id);
  if (!existing) return undefined;

  const next: Collection = {
    ...existing,
    ...patch,
    name: patch.name?.trim() || existing.name,
    description: patch.description ?? existing.description,
    updatedAt: Date.now(),
  };
  await db.collections.put(next);
  return next;
}

export async function deleteCollection(id: string): Promise<void> {
  await db.transaction('rw', db.collections, db.highlights, async () => {
    await db.collections.delete(id);
    const highlights = await db.highlights.filter((h) => h.collectionIds.includes(id)).toArray();
    await Promise.all(
      highlights.map((highlight) =>
        db.highlights.update(highlight.id, {
          collectionIds: highlight.collectionIds.filter((cid) => cid !== id),
          updatedAt: Date.now(),
        }),
      ),
    );
  });
}
