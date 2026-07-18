import type { HighlightColor } from '@/types';
import { HIGHLIGHT_COLOR_LIST, HIGHLIGHT_COLORS, TOOLBAR_HIDE_DELAY_MS, TOOLBAR_ROOT_ID } from '@/utils/constants';

export interface ToolbarHandlers {
  onHighlight: (color: HighlightColor) => void;
  onNote: (color: HighlightColor) => void;
  onCopy: () => void;
  onClear: () => void;
}

let hideTimer: number | undefined;
let activeColor: HighlightColor = 'yellow';

function clearHideTimer(): void {
  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = undefined;
  }
}

export function destroyToolbar(): void {
  clearHideTimer();
  document.getElementById(TOOLBAR_ROOT_ID)?.remove();
}

export function scheduleToolbarHide(delay = TOOLBAR_HIDE_DELAY_MS): void {
  clearHideTimer();
  hideTimer = window.setTimeout(() => destroyToolbar(), delay);
}

function colorSwatch(color: HighlightColor, selected: boolean): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'kos-toolbar-swatch';
  button.title = HIGHLIGHT_COLORS[color].label;
  button.setAttribute('aria-label', `Highlight color ${HIGHLIGHT_COLORS[color].label}`);
  button.dataset.color = color;
  button.style.background = HIGHLIGHT_COLORS[color].bg;
  button.style.outline = selected ? `2px solid ${HIGHLIGHT_COLORS[color].border}` : 'none';
  return button;
}

export function showToolbar(rect: DOMRect, handlers: ToolbarHandlers, color: HighlightColor): void {
  destroyToolbar();
  activeColor = color;

  const root = document.createElement('div');
  root.id = TOOLBAR_ROOT_ID;
  root.className = 'kos-toolbar';
  root.setAttribute('role', 'toolbar');
  root.setAttribute('aria-label', 'InkMind highlight toolbar');

  const swatches = document.createElement('div');
  swatches.className = 'kos-toolbar-swatches';
  for (const c of HIGHLIGHT_COLOR_LIST) {
    const swatch = colorSwatch(c, c === activeColor);
    swatch.addEventListener('mousedown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      activeColor = c;
      swatches.querySelectorAll<HTMLButtonElement>('.kos-toolbar-swatch').forEach((btn) => {
        const btnColor = btn.dataset.color as HighlightColor;
        btn.style.outline =
          btnColor === activeColor ? `2px solid ${HIGHLIGHT_COLORS[btnColor].border}` : 'none';
      });
      scheduleToolbarHide();
    });
    swatches.appendChild(swatch);
  }

  const actions = document.createElement('div');
  actions.className = 'kos-toolbar-actions';

  const makeAction = (label: string, onClick: () => void): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kos-toolbar-btn';
    button.textContent = label;
    button.addEventListener('mousedown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  };

  actions.append(
    makeAction('Highlight', () => handlers.onHighlight(activeColor)),
    makeAction('Add Note', () => handlers.onNote(activeColor)),
    makeAction('Copy', () => handlers.onCopy()),
    makeAction('Clear', () => handlers.onClear()),
  );

  root.append(swatches, actions);
  document.documentElement.appendChild(root);

  const top = window.scrollY + rect.top - root.offsetHeight - 10;
  const left = window.scrollX + rect.left + rect.width / 2 - root.offsetWidth / 2;
  root.style.top = `${Math.max(8, top)}px`;
  root.style.left = `${Math.max(8, left)}px`;

  root.addEventListener('mouseenter', clearHideTimer);
  root.addEventListener('mouseleave', () => scheduleToolbarHide());
  scheduleToolbarHide();
}
