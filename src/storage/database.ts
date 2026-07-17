import Dexie, { type Table } from 'dexie';
import type { Collection, Highlight, Tag, UserSettings } from '@/types';
import { DB_NAME, DB_VERSION } from '@/utils/constants';

export class KnowledgeOsDatabase extends Dexie {
  highlights!: Table<Highlight, string>;
  tags!: Table<Tag, string>;
  collections!: Table<Collection, string>;
  settings!: Table<UserSettings & { id: string }, string>;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      highlights:
        'id, url, canonicalUrl, pageTitle, color, createdAt, updatedAt, pageType, *tags, *collectionIds',
      tags: 'id, name, createdAt',
      collections: 'id, name, createdAt, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new KnowledgeOsDatabase();
