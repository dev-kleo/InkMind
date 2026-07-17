import { useEffect, useState } from 'react';
import { Keyboard, Moon, Palette, Save, Type } from 'lucide-react';
import type { ExportFormat, FontSize, HighlightColor, ThemeMode } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ColorSwatch } from '@/components/ColorSwatch';
import { useSettings } from '@/hooks/useSettings';
import { HIGHLIGHT_COLOR_LIST, APP_NAME } from '@/utils/constants';
import { exportAndDownload } from '@/services/export-service';

export function OptionsApp() {
  const { settings, loading, save } = useSettings();
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    document.title = `${APP_NAME} Settings`;
  }, []);

  const persist = async (patch: Parameters<typeof save>[0]) => {
    await save(patch);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  if (loading) {
    return <div className="p-8 text-sm text-ink-muted">Loading settings…</div>;
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            {APP_NAME}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
            Settings
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Configure local defaults. Everything stays on this device — no accounts, no cloud.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-surface-elevated p-5 shadow-panel">
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-brand-600" />
              <h2 className="font-display text-xl text-ink">Highlighting</h2>
            </div>
            <p className="kos-label">Default highlight color</p>
            <div className="flex flex-wrap gap-3">
              {HIGHLIGHT_COLOR_LIST.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={settings.defaultHighlightColor === color}
                  onSelect={(next: HighlightColor) =>
                    void persist({ defaultHighlightColor: next })
                  }
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-surface-elevated p-5 shadow-panel">
            <div className="mb-4 flex items-center gap-2">
              <Moon className="h-4 w-4 text-brand-600" />
              <h2 className="font-display text-xl text-ink">Appearance</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="kos-label">Theme</span>
                <select
                  className="kos-input"
                  value={settings.theme}
                  onChange={(event) =>
                    void persist({ theme: event.target.value as ThemeMode })
                  }
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
              <label>
                <span className="kos-label">Font size</span>
                <select
                  className="kos-input"
                  value={settings.fontSize}
                  onChange={(event) =>
                    void persist({ fontSize: event.target.value as FontSize })
                  }
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-ink-subtle">
              <Type className="h-3.5 w-3.5" />
              Applies to popup, sidebar, and settings.
            </p>
          </section>

          <section className="rounded-3xl border border-line bg-surface-elevated p-5 shadow-panel">
            <div className="mb-4 flex items-center gap-2">
              <Save className="h-4 w-4 text-brand-600" />
              <h2 className="font-display text-xl text-ink">Backup & export</h2>
            </div>
            <label className="mb-4 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(event) => void persist({ autoBackup: event.target.checked })}
              />
              Remind me to export a local backup weekly
            </label>
            <label className="mb-4 block">
              <span className="kos-label">Default export format</span>
              <select
                className="kos-input"
                value={settings.exportFormat}
                onChange={(event) =>
                  void persist({ exportFormat: event.target.value as ExportFormat })
                }
              >
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
                <option value="text">Plain text</option>
              </select>
            </label>
            <button
              type="button"
              className="kos-btn-secondary"
              onClick={() =>
                void exportAndDownload({ format: settings.exportFormat })
              }
            >
              Export all highlights now
            </button>
          </section>

          <section className="rounded-3xl border border-line bg-surface-elevated p-5 shadow-panel">
            <div className="mb-4 flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-brand-600" />
              <h2 className="font-display text-xl text-ink">Keyboard shortcuts</h2>
            </div>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li className="flex justify-between gap-4 rounded-xl bg-surface-muted px-3 py-2">
                <span>Highlight selection</span>
                <kbd className="font-mono text-ink">{settings.shortcuts.highlightSelection}</kbd>
              </li>
              <li className="flex justify-between gap-4 rounded-xl bg-surface-muted px-3 py-2">
                <span>Create note</span>
                <kbd className="font-mono text-ink">{settings.shortcuts.createNote}</kbd>
              </li>
              <li className="flex justify-between gap-4 rounded-xl bg-surface-muted px-3 py-2">
                <span>Open sidebar</span>
                <kbd className="font-mono text-ink">{settings.shortcuts.openSidebar}</kbd>
              </li>
            </ul>
            <p className="mt-3 text-xs text-ink-subtle">
              Customize these in Chrome at{' '}
              <button
                type="button"
                className="underline"
                onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
              >
                chrome://extensions/shortcuts
              </button>
              .
            </p>
          </section>
        </div>

        {savedFlash ? (
          <div className="fixed bottom-6 right-6 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-float animate-scale-in">
            Saved
          </div>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}
