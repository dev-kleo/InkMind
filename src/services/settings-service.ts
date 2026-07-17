import type { UserSettings } from '@/types';
import { db } from '@/storage/database';
import { ensureSeedData } from '@/storage/seed';
import { DEFAULT_SETTINGS } from '@/utils/constants';

const SETTINGS_ID = 'default';

export async function getSettings(): Promise<UserSettings> {
  await ensureSeedData();
  const row = await db.settings.get(SETTINGS_ID);
  if (!row) return { ...DEFAULT_SETTINGS };

  const { id: _id, ...settings } = row;
  return settings;
}

export async function updateSettings(
  patch: Partial<UserSettings>,
): Promise<UserSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch, shortcuts: { ...current.shortcuts, ...patch.shortcuts } };
  await db.settings.put({ id: SETTINGS_ID, ...next });
  return next;
}

export async function resetSettings(): Promise<UserSettings> {
  await db.settings.put({ id: SETTINGS_ID, ...DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS };
}
