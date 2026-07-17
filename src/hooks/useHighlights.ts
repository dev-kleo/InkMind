import { useCallback, useEffect, useState } from 'react';
import type { Highlight, HighlightFilters } from '@/types';
import {
  deleteHighlight,
  listHighlights,
  updateHighlight,
} from '@/services/highlight-service';
import { broadcastHighlightsChanged } from '@/services/messaging';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';

const emptyFilters: HighlightFilters = {
  query: '',
  colors: [],
  tags: [],
  collectionId: null,
  pageUrl: null,
  hasNote: null,
};

export function useHighlights(initial: Partial<HighlightFilters> = {}) {
  const [filters, setFilters] = useState<HighlightFilters>({ ...emptyFilters, ...initial });
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebouncedValue(filters.query, SEARCH_DEBOUNCE_MS);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listHighlights({ ...filters, query: debouncedQuery });
      setHighlights(items);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedQuery]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const listener = (message: { type?: string }) => {
      if (message.type === 'HIGHLIGHTS_CHANGED' || message.type === 'SETTINGS_CHANGED') {
        void refresh();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteHighlight(id);
    broadcastHighlightsChanged();
    setHighlights((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const patch = useCallback(async (id: string, data: Parameters<typeof updateHighlight>[1]) => {
    const next = await updateHighlight(id, data);
    if (!next) return;
    broadcastHighlightsChanged();
    setHighlights((prev) => prev.map((item) => (item.id === id ? next : item)));
  }, []);

  return {
    highlights,
    filters,
    setFilters,
    loading,
    refresh,
    remove,
    patch,
  };
}
