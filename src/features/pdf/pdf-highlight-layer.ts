import type { Highlight, PdfRect } from '@/types';
import { HIGHLIGHT_COLORS } from '@/utils/constants';

export function renderPdfHighlightOverlay(
  container: HTMLElement,
  pageNumber: number,
  highlights: Highlight[],
  viewportWidth: number,
  viewportHeight: number,
): void {
  container.replaceChildren();
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = `${viewportWidth}px`;
  container.style.height = `${viewportHeight}px`;
  container.style.pointerEvents = 'none';

  for (const highlight of highlights) {
    if (highlight.pageType !== 'pdf') continue;
    const rects = (highlight.pdfRects ?? []).filter((rect) => rect.pageNumber === pageNumber);
    for (const rect of rects) {
      const el = document.createElement('div');
      el.className = 'kos-pdf-highlight';
      el.dataset.highlightId = highlight.id;
      el.style.position = 'absolute';
      el.style.left = `${rect.x * viewportWidth}px`;
      el.style.top = `${rect.y * viewportHeight}px`;
      el.style.width = `${rect.width * viewportWidth}px`;
      el.style.height = `${rect.height * viewportHeight}px`;
      el.style.background = HIGHLIGHT_COLORS[highlight.color].bg;
      el.style.borderBottom = `2px solid ${HIGHLIGHT_COLORS[highlight.color].border}`;
      el.style.borderRadius = '2px';
      el.title = highlight.note || highlight.text;
      container.appendChild(el);
    }
  }
}

/**
 * Convert a DOM selection inside a PDF text layer into normalized page rects.
 */
export function selectionToPdfRects(
  selection: Selection,
  pageElement: HTMLElement,
  pageNumber: number,
): PdfRect[] {
  if (!selection.rangeCount) return [];
  const range = selection.getRangeAt(0);
  const pageRect = pageElement.getBoundingClientRect();
  const clientRects = Array.from(range.getClientRects());

  return clientRects
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .map((rect) => ({
      pageNumber,
      x: (rect.left - pageRect.left) / pageRect.width,
      y: (rect.top - pageRect.top) / pageRect.height,
      width: rect.width / pageRect.width,
      height: rect.height / pageRect.height,
    }));
}
