import { useCallback, useEffect, useState } from 'react';
import type { UserSettings } from '@/types';
import { getSettings, updateSettings } from '@/services/settings-service';
import { applyTheme, watchSystemTheme } from '@/services/theme';
import { DEFAULT_SETTINGS } from '@/utils/constants';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getSettings();
    setSettings(next);
    applyTheme(next.theme, next.fontSize);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    return watchSystemTheme(() => applyTheme('system', settings.fontSize));
  }, [settings.theme, settings.fontSize]);

  const save = useCallback(async (patch: Partial<UserSettings>) => {
    const next = await updateSettings(patch);
    setSettings(next);
    applyTheme(next.theme, next.fontSize);
    void chrome.runtime.sendMessage({ type: 'SETTINGS_CHANGED', payload: next }).catch(() => undefined);
    return next;
  }, []);

  return { settings, loading, save, refresh };
}
