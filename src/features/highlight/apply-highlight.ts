import type { Highlight, HighlightColor } from '@/types';
import { HIGHLIGHT_ATTR, HIGHLIGHT_COLORS } from '@/utils/constants';
import { resolveLocatorToRange } from '@/utils/dom-locator';

function wrapRange(range: Range, highlight: Highlight): void {
  const color = HIGHLIGHT_COLORS[highlight.color];
  const mark = document.createElement('mark');
  mark.className = 'kos-highlight';
  mark.setAttribute(HIGHLIGHT_ATTR, highlight.id);
  mark.setAttribute('data-kos-color', highlight.color);
  mark.style.backgroundColor = color.bg;
  mark.style.borderBottom = `2px solid ${color.border}`;
  mark.style.borderRadius = '2px';
  mark.style.cursor = 'pointer';
  mark.title = highlight.note ? `Note: ${highlight.note}` : 'KnowledgeOS highlight';

  try {
    range.surroundContents(mark);
  } catch {
    const fragment = range.extractContents();
    mark.appendChild(fragment);
    range.insertNode(mark);
  }
}

export function applyHighlightToDom(highlight: Highlight): boolean {
  if (!highlight.locator) return false;
  if (document.querySelector(`[${HIGHLIGHT_ATTR}="${highlight.id}"]`)) return true;

  const range = resolveLocatorToRange(highlight.locator);
  if (!range) return false;

  wrapRange(range, highlight);
  return true;
}

export function removeHighlightFromDom(id: string): void {
  const marks = document.querySelectorAll(`[${HIGHLIGHT_ATTR}="${id}"]`);
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
    parent.normalize();
  });
}

export function updateHighlightColorInDom(id: string, color: HighlightColor): void {
  const marks = document.querySelectorAll<HTMLElement>(`[${HIGHLIGHT_ATTR}="${id}"]`);
  const palette = HIGHLIGHT_COLORS[color];
  marks.forEach((mark) => {
    mark.setAttribute('data-kos-color', color);
    mark.style.backgroundColor = palette.bg;
    mark.style.borderBottom = `2px solid ${palette.border}`;
  });
}

export function scrollToHighlight(id: string): void {
  const el = document.querySelector(`[${HIGHLIGHT_ATTR}="${id}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('kos-highlight-pulse');
  window.setTimeout(() => el.classList.remove('kos-highlight-pulse'), 1200);
}

export function restoreHighlights(highlights: Highlight[]): number {
  let applied = 0;
  for (const highlight of highlights) {
    if (highlight.pageType === 'pdf') continue;
    if (applyHighlightToDom(highlight)) applied += 1;
  }
  return applied;
}
