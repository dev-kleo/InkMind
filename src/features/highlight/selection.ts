import { buildLocatorFromRange } from '@/utils/dom-locator';
import type { DomLocator } from '@/types';

export interface ActiveSelection {
  text: string;
  range: Range;
  locator: DomLocator | null;
  rect: DOMRect;
}

export function getActiveSelection(): ActiveSelection | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const text = selection.toString().trim();
  if (!text) return null;

  const range = selection.getRangeAt(0).cloneRange();
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return null;

  return {
    text,
    range,
    locator: buildLocatorFromRange(range),
    rect,
  };
}

export function clearSelection(): void {
  const selection = window.getSelection();
  selection?.removeAllRanges();
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      area.remove();
    }
  });
}
