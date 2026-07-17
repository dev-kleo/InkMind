import { db } from '@/storage/database';
import { createId } from '@/utils/id';
import {
  DEFAULT_COLLECTIONS,
  DEFAULT_SETTINGS,
  DEFAULT_TAGS,
} from '@/utils/constants';

const SETTINGS_ID = 'default';

export async function ensureSeedData(): Promise<void> {
  const settings = await db.settings.get(SETTINGS_ID);
  if (!settings) {
    await db.settings.put({ id: SETTINGS_ID, ...DEFAULT_SETTINGS });
  }

  const tagCount = await db.tags.count();
  if (tagCount === 0) {
    const now = Date.now();
    await db.tags.bulkAdd(
      DEFAULT_TAGS.map((tag) => ({
        id: createId('tag'),
        name: tag.name,
        color: tag.color,
        createdAt: now,
      })),
    );
  }

  const collectionCount = await db.collections.count();
  if (collectionCount === 0) {
    const now = Date.now();
    await db.collections.bulkAdd(
      DEFAULT_COLLECTIONS.map((collection) => ({
        id: createId('col'),
        name: collection.name,
        description: collection.description,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }
}
