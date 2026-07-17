import type { FontSize, ThemeMode } from '@/types';
import { FONT_SIZE_MAP } from '@/utils/constants';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme;
}

export function applyTheme(theme: ThemeMode, fontSize: FontSize = 'medium'): void {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.setProperty('--kos-font-size', FONT_SIZE_MAP[fontSize]);
  root.dataset.theme = resolved;
}

export function watchSystemTheme(onChange: () => void): () => void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => onChange();
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
