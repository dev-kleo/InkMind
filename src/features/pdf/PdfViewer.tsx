import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  Highlighter,
  StickyNote,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { Highlight, HighlightColor } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ColorSwatch } from '@/components/ColorSwatch';
import { useSettings } from '@/hooks/useSettings';
import {
  createHighlight,
  getHighlightsForUrl,
} from '@/services/highlight-service';
import { broadcastHighlightsChanged } from '@/services/messaging';
import { promptForNote } from '@/features/highlight/note-prompt';
import {
  renderPdfHighlightOverlay,
  selectionToPdfRects,
} from '@/features/pdf/pdf-highlight-layer';
import { HIGHLIGHT_COLOR_LIST } from '@/utils/constants';
import { clearSelection, copyText } from '@/features/highlight/selection';
import '@/content/content.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  src: string;
}

async function renderPage(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  host: HTMLElement,
  highlights: Highlight[],
): Promise<void> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const pageShell = document.createElement('div');
  pageShell.className = 'kos-pdf-page relative mx-auto mb-6 overflow-hidden rounded-xl bg-white shadow-panel';
  pageShell.dataset.pageNumber = String(pageNumber);
  pageShell.style.width = `${viewport.width}px`;
  pageShell.style.height = `${viewport.height}px`;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.className = 'block';

  const textLayer = document.createElement('div');
  textLayer.className = 'kos-pdf-textlayer';
  textLayer.style.position = 'absolute';
  textLayer.style.left = '0';
  textLayer.style.top = '0';
  textLayer.style.width = `${viewport.width}px`;
  textLayer.style.height = `${viewport.height}px`;
  textLayer.style.overflow = 'hidden';
  textLayer.style.opacity = '0.25';
  textLayer.style.lineHeight = '1';
  textLayer.style.userSelect = 'text';

  const overlay = document.createElement('div');
  overlay.className = 'kos-pdf-overlay';

  pageShell.append(canvas, textLayer, overlay);
  host.appendChild(pageShell);

  await page.render({ canvasContext: context, viewport }).promise;

  const textContent = await page.getTextContent();
  for (const item of textContent.items) {
    if (!('str' in item)) continue;
    const tx = pdfjs.Util.transform(viewport.transform, item.transform);
    const span = document.createElement('span');
    span.textContent = item.str;
    span.style.position = 'absolute';
    span.style.left = `${tx[4]}px`;
    span.style.top = `${tx[5] - item.height * scale}px`;
    span.style.fontSize = `${item.height * scale}px`;
    span.style.fontFamily = 'sans-serif';
    span.style.whiteSpace = 'pre';
    span.style.transformOrigin = '0% 0%';
    textLayer.appendChild(span);
  }

  renderPdfHighlightOverlay(overlay, pageNumber, highlights, viewport.width, viewport.height);
}

export function PdfViewer({ src }: PdfViewerProps) {
  const { settings } = useSettings();
  const hostRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState(1.15);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [color, setColor] = useState<HighlightColor>(settings.defaultHighlightColor);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const title = useMemo(() => {
    try {
      return decodeURIComponent(src.split('/').pop() || 'PDF document');
    } catch {
      return 'PDF document';
    }
  }, [src]);

  const reloadHighlights = useCallback(async () => {
    const items = await getHighlightsForUrl(src);
    setHighlights(items);
  }, [src]);

  useEffect(() => {
    setColor(settings.defaultHighlightColor);
  }, [settings.defaultHighlightColor]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const task = pdfjs.getDocument(src);
        const doc = await task.promise;
        if (cancelled) return;
        setPdf(doc);
        setPageCount(doc.numPages);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    void reloadHighlights();
  }, [reloadHighlights]);

  useEffect(() => {
    if (!pdf || !hostRef.current) return;
    const host = hostRef.current;
    host.replaceChildren();
    let cancelled = false;

    void (async () => {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) return;
        await renderPage(pdf, pageNumber, scale, host, highlights);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdf, scale, highlights]);

  const captureSelection = async (withNote: boolean) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString().trim();
    if (!text) return;

    const anchor = selection.anchorNode?.parentElement?.closest('.kos-pdf-page') as HTMLElement | null;
    if (!anchor) return;
    const pageNumber = Number(anchor.dataset.pageNumber || '1');
    const pdfRects = selectionToPdfRects(selection, anchor, pageNumber);

    let note = '';
    if (withNote) {
      const drafted = await promptForNote();
      if (drafted === null) return;
      note = drafted;
    }

    await createHighlight({
      text,
      color,
      note,
      pageType: 'pdf',
      pdfPageNumber: pageNumber,
      pdfRects,
      url: src,
      pageTitle: title,
      locator: null,
    });

    clearSelection();
    broadcastHighlightsChanged();
    await reloadHighlights();
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-ink">KnowledgeOS PDF</p>
              <p className="truncate text-xs text-ink-subtle">{title} · {pageCount} pages</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-elevated px-2 py-1">
                {HIGHLIGHT_COLOR_LIST.map((item) => (
                  <ColorSwatch
                    key={item}
                    color={item}
                    size="sm"
                    selected={color === item}
                    onSelect={setColor}
                  />
                ))}
              </div>
              <button type="button" className="kos-btn-primary" onClick={() => void captureSelection(false)}>
                <Highlighter className="h-4 w-4" />
                Highlight
              </button>
              <button type="button" className="kos-btn-secondary" onClick={() => void captureSelection(true)}>
                <StickyNote className="h-4 w-4" />
                Note
              </button>
              <button
                type="button"
                className="kos-btn-ghost"
                onClick={() => {
                  const text = window.getSelection()?.toString();
                  if (text) void copyText(text);
                }}
              >
                Copy
              </button>
              <button type="button" className="kos-btn-ghost" onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </button>
              <button type="button" className="kos-btn-ghost" onClick={() => setScale((s) => Math.min(2.4, s + 0.1))}>
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6">
          {error ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface-elevated p-6 text-sm text-ink">
              <p className="font-semibold">Could not open this PDF</p>
              <p className="mt-2 text-ink-muted">{error}</p>
              <p className="mt-3 text-ink-subtle">
                Some sites block cross-origin PDF fetches. Download the file and open it from a local URL, or use a
                publicly accessible PDF link.
              </p>
            </div>
          ) : (
            <div ref={hostRef} className="mx-auto max-w-5xl" />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
