import { useEffect, useState } from 'react';
import {
  FileText,
  Highlighter,
  PanelRightOpen,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import type { Highlight, PageInfo } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SearchInput } from '@/components/SearchInput';
import { EmptyState } from '@/components/EmptyState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSettings } from '@/hooks/useSettings';
import {
  getRecentHighlights,
  getTodayHighlights,
  listHighlights,
} from '@/services/highlight-service';
import { getActiveTab, sendRuntimeMessage, sendTabMessage } from '@/services/messaging';
import { formatRelativeTime } from '@/utils/date';
import { displayHost, isPdfUrl } from '@/utils/url';
import { APP_NAME, HIGHLIGHT_COLORS, SEARCH_DEBOUNCE_MS } from '@/utils/constants';

export function PopupApp() {
  useSettings();
  const [today, setToday] = useState<Highlight[]>([]);
  const [recent, setRecent] = useState<Highlight[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Highlight[]>([]);
  const [page, setPage] = useState<PageInfo | null>(null);
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    void (async () => {
      const [todayItems, recentItems, tab] = await Promise.all([
        getTodayHighlights(),
        getRecentHighlights(8),
        getActiveTab(),
      ]);
      setToday(todayItems);
      setRecent(recentItems);

      if (tab?.url) {
        const info: PageInfo = {
          url: tab.url,
          title: tab.title ?? 'Untitled',
          pageType: isPdfUrl(tab.url) ? 'pdf' : 'webpage',
          isPdf: isPdfUrl(tab.url),
        };
        setPage(info);
      }
    })();
  }, []);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    void listHighlights({ query: debounced }).then(setResults);
  }, [debounced]);

  const openSidebar = () => {
    void sendRuntimeMessage('OPEN_SIDEBAR');
  };

  const highlightSelection = async () => {
    const tab = await getActiveTab();
    if (!tab?.id) return;
    await sendTabMessage(tab.id, 'HIGHLIGHT_SELECTION');
    window.close();
  };

  const openPdfViewer = async () => {
    if (!page?.url) return;
    const viewer = chrome.runtime.getURL(`pdf.html?src=${encodeURIComponent(page.url)}`);
    await chrome.tabs.create({ url: viewer });
    window.close();
  };

  const renderList = (items: Highlight[], empty: string) => {
    if (!items.length) {
      return <p className="text-xs text-ink-subtle">{empty}</p>;
    }
    return (
      <ul className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-line bg-surface-elevated px-3 py-2 transition hover:border-brand-400"
            >
              <p className="line-clamp-2 text-sm text-ink">
                <span style={{ backgroundColor: HIGHLIGHT_COLORS[item.color].bg }}>
                  {item.text}
                </span>
              </p>
              <p className="mt-1 truncate text-[11px] text-ink-subtle">
                {displayHost(item.url)} · {formatRelativeTime(item.createdAt)}
              </p>
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ErrorBoundary>
      <div className="w-[380px] p-4">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {APP_NAME}
            </h1>
            <p className="text-xs text-ink-muted">Capture knowledge without leaving the page</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className="kos-btn-ghost !p-2"
              aria-label="Open sidebar"
              onClick={openSidebar}
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="kos-btn-ghost !p-2"
              aria-label="Open settings"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button type="button" className="kos-btn-primary" onClick={() => void highlightSelection()}>
            <Highlighter className="h-4 w-4" />
            Highlight
          </button>
          <button type="button" className="kos-btn-secondary" onClick={openSidebar}>
            <Sparkles className="h-4 w-4" />
            Open sidebar
          </button>
        </div>

        {page?.isPdf ? (
          <button type="button" className="kos-btn-secondary mb-4 w-full" onClick={() => void openPdfViewer()}>
            <FileText className="h-4 w-4" />
            Open PDF in InkMind
          </button>
        ) : null}

        <div className="mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Quick search…" />
        </div>

        {query.trim() ? (
          <section className="mb-4">
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              <Search className="h-3.5 w-3.5" />
              Results
            </h2>
            {results.length ? (
              renderList(results, '')
            ) : (
              <EmptyState title="No matches" description="Try another keyword." />
            )}
          </section>
        ) : (
          <>
            <section className="mb-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Today · {today.length}
              </h2>
              {renderList(today, 'No highlights yet today.')}
            </section>
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                Recent
              </h2>
              {renderList(recent, 'Highlight something to get started.')}
            </section>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
