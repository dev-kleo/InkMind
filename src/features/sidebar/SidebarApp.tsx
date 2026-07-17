import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  FolderKanban,
  Highlighter,
  Settings,
  Tags,
} from 'lucide-react';
import type { Collection, Highlight, PageInfo, Tag } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SearchInput } from '@/components/SearchInput';
import { useHighlights } from '@/hooks/useHighlights';
import { useSettings } from '@/hooks/useSettings';
import { listTags, createTag, deleteTag } from '@/services/tag-service';
import {
  listCollections,
  createCollection,
  deleteCollection,
} from '@/services/collection-service';
import { sendTabMessage, getActiveTab } from '@/services/messaging';
import { displayHost } from '@/utils/url';
import { FilterBar } from '@/features/sidebar/FilterBar';
import { HighlightList } from '@/features/sidebar/HighlightList';
import { TagsPanel } from '@/features/sidebar/TagsPanel';
import { CollectionsPanel } from '@/features/sidebar/CollectionsPanel';
import { ExportPanel } from '@/features/sidebar/ExportPanel';
import { APP_NAME } from '@/utils/constants';

type SidebarTab = 'highlights' | 'tags' | 'collections' | 'export';

export function SidebarApp() {
  const { settings } = useSettings();
  const [page, setPage] = useState<PageInfo | null>(null);
  const [tab, setTab] = useState<SidebarTab>('highlights');
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pageOnly, setPageOnly] = useState(true);

  const { highlights, filters, setFilters, loading, remove, patch } = useHighlights({
    pageUrl: null,
  });

  const refreshMeta = useCallback(async () => {
    const [tagRows, collectionRows, activeTab] = await Promise.all([
      listTags(),
      listCollections(),
      getActiveTab(),
    ]);
    setTags(tagRows);
    setCollections(collectionRows);

    if (activeTab?.id) {
      try {
        const info = await sendTabMessage<undefined, PageInfo>(activeTab.id, 'GET_PAGE_INFO');
        setPage(info);
        if (pageOnly && info?.url) {
          setFilters((prev) => ({ ...prev, pageUrl: info.url }));
        }
      } catch {
        if (activeTab.url) {
          const info: PageInfo = {
            url: activeTab.url,
            title: activeTab.title ?? 'Untitled',
            pageType: 'webpage',
            isPdf: false,
          };
          setPage(info);
          if (pageOnly) setFilters((prev) => ({ ...prev, pageUrl: info.url }));
        }
      }
    }
  }, [pageOnly, setFilters]);

  useEffect(() => {
    void refreshMeta();
  }, [refreshMeta]);

  useEffect(() => {
    const listener = (
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tabInfo: chrome.tabs.Tab,
    ) => {
      if (changeInfo.status === 'complete' && tabInfo.active) {
        void refreshMeta();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.onActivated.addListener(() => void refreshMeta());
    return () => {
      chrome.tabs.onUpdated.removeListener(listener);
    };
  }, [refreshMeta]);

  const openHighlight = async (highlight: Highlight) => {
    const [tabInfo] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabInfo?.id && tabInfo.url && highlight.canonicalUrl.includes(new URL(tabInfo.url).hostname)) {
      await sendTabMessage(tabInfo.id, 'SCROLL_TO_HIGHLIGHT', { id: highlight.id });
      return;
    }
    await chrome.tabs.create({ url: highlight.url });
  };

  const tabs: { id: SidebarTab; label: string; icon: typeof Highlighter }[] = [
    { id: 'highlights', label: 'Highlights', icon: Highlighter },
    { id: 'tags', label: 'Tags', icon: Tags },
    { id: 'collections', label: 'Collections', icon: FolderKanban },
    { id: 'export', label: 'Export', icon: BookOpen },
  ];

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col">
        <header className="border-b border-line px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-ink">
                {APP_NAME}
              </p>
              <p className="text-xs text-ink-subtle">Offline knowledge workspace</p>
            </div>
            <button
              type="button"
              className="kos-btn-ghost !p-2"
              aria-label="Open settings"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-surface-elevated px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">
              {page?.title || 'No active page'}
            </p>
            <p className="truncate text-xs text-ink-subtle">
              {page ? displayHost(page.url) : 'Focus a tab to scope highlights'}
            </p>
          </div>
        </header>

        <div className="space-y-3 border-b border-line px-4 py-3">
          <SearchInput
            value={filters.query}
            onChange={(query) => setFilters((prev) => ({ ...prev, query }))}
          />
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={pageOnly}
              onChange={(event) => {
                const checked = event.target.checked;
                setPageOnly(checked);
                setFilters((prev) => ({
                  ...prev,
                  pageUrl: checked ? page?.url ?? null : null,
                }));
              }}
            />
            Current page only
          </label>
          <nav className="grid grid-cols-4 gap-1" aria-label="Sidebar sections">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    active
                      ? 'kos-btn-primary !px-2 !py-2 !text-[11px]'
                      : 'kos-btn-ghost !px-2 !py-2 !text-[11px]'
                  }
                  onClick={() => setTab(item.id)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3">
          {tab === 'highlights' ? (
            <>
              <FilterBar
                filters={filters}
                tags={tags}
                collections={collections}
                onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
              />
              <div className="min-h-0 flex-1">
                <HighlightList
                  highlights={highlights}
                  loading={loading}
                  onDelete={(id) => void remove(id)}
                  onUpdate={(id, data) => void patch(id, data)}
                  onOpen={(highlight) => void openHighlight(highlight)}
                  tags={tags}
                  collections={collections}
                />
              </div>
            </>
          ) : null}

          {tab === 'tags' ? (
            <TagsPanel
              tags={tags}
              onCreate={async (name) => {
                await createTag(name);
                setTags(await listTags());
              }}
              onDelete={async (id) => {
                await deleteTag(id);
                setTags(await listTags());
              }}
            />
          ) : null}

          {tab === 'collections' ? (
            <CollectionsPanel
              collections={collections}
              onCreate={async (name, description) => {
                await createCollection(name, description);
                setCollections(await listCollections());
              }}
              onDelete={async (id) => {
                await deleteCollection(id);
                setCollections(await listCollections());
              }}
            />
          ) : null}

          {tab === 'export' ? (
            <ExportPanel
              pageUrl={page?.url ?? null}
              collectionId={filters.collectionId}
              defaultFormat={settings.exportFormat}
            />
          ) : null}
        </main>
      </div>
    </ErrorBoundary>
  );
}
