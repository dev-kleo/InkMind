import type { ExtensionMessage, HighlightColor } from '@/types';
import { createHighlight, deleteHighlight, getHighlightsForUrl } from '@/services/highlight-service';
import { getSettings } from '@/services/settings-service';
import { ensureSeedData } from '@/storage/seed';
import { broadcastHighlightsChanged } from '@/services/messaging';
import { isPdfUrl } from '@/utils/url';
import {
  applyHighlightToDom,
  removeHighlightFromDom,
  restoreHighlights,
  scrollToHighlight,
  updateHighlightColorInDom,
} from '@/features/highlight/apply-highlight';
import { clearSelection, copyText, getActiveSelection } from '@/features/highlight/selection';
import { destroyToolbar, showToolbar } from '@/features/highlight/toolbar';
import { promptForNote } from '@/features/highlight/note-prompt';
import { HIGHLIGHT_ATTR } from '@/utils/constants';

let bootstrapped = false;

async function highlightCurrentSelection(
  color?: HighlightColor,
  withNote = false,
): Promise<void> {
  const selection = getActiveSelection();
  if (!selection) return;

  const settings = await getSettings();
  const chosenColor = color ?? settings.defaultHighlightColor;
  let note = '';

  if (withNote) {
    const drafted = await promptForNote();
    if (drafted === null) return;
    note = drafted;
  }

  const highlight = await createHighlight({
    text: selection.text,
    color: chosenColor,
    note,
    locator: selection.locator,
    pageType: 'webpage',
    url: location.href,
    pageTitle: document.title,
  });

  applyHighlightToDom(highlight);
  clearSelection();
  destroyToolbar();
  broadcastHighlightsChanged();
}

async function handleCopy(): Promise<void> {
  const selection = getActiveSelection();
  if (!selection) return;
  await copyText(selection.text);
  destroyToolbar();
}

function handleToolbarForSelection(): void {
  const selection = getActiveSelection();
  if (!selection) {
    destroyToolbar();
    return;
  }

  void getSettings().then((settings) => {
    showToolbar(
      selection.rect,
      {
        onHighlight: (color) => void highlightCurrentSelection(color, false),
        onNote: (color) => void highlightCurrentSelection(color, true),
        onCopy: () => void handleCopy(),
        onClear: () => {
          clearSelection();
          destroyToolbar();
        },
      },
      settings.defaultHighlightColor,
    );
  });
}

async function restorePageHighlights(): Promise<void> {
  const highlights = await getHighlightsForUrl(location.href);
  restoreHighlights(highlights);
}

function bindHighlightClicks(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const mark = target?.closest?.(`[${HIGHLIGHT_ATTR}]`) as HTMLElement | null;
    if (!mark) return;
    const id = mark.getAttribute(HIGHLIGHT_ATTR);
    if (!id) return;
    void chrome.runtime.sendMessage({
      type: 'SCROLL_TO_HIGHLIGHT',
      payload: { id, source: 'content' },
    });
  });
}

function bindSelectionEvents(): void {
  document.addEventListener('mouseup', () => {
    window.setTimeout(() => handleToolbarForSelection(), 10);
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') destroyToolbar();
  });

  document.addEventListener(
    'scroll',
    () => {
      destroyToolbar();
    },
    true,
  );
}

async function bootstrap(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  if (isPdfUrl(location.href)) {
    // Native Chrome PDF viewer pages are restricted; offer open-in-viewer via background.
    return;
  }

  await ensureSeedData();
  await restorePageHighlights();
  bindSelectionEvents();
  bindHighlightClicks();
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  const handle = async () => {
    switch (message.type) {
      case 'PING':
        return { ok: true };
      case 'GET_PAGE_INFO':
        return {
          url: location.href,
          title: document.title,
          pageType: isPdfUrl(location.href) ? 'pdf' : 'webpage',
          isPdf: isPdfUrl(location.href),
        };
      case 'HIGHLIGHT_SELECTION':
        await highlightCurrentSelection(undefined, false);
        return { ok: true };
      case 'CREATE_NOTE':
        await highlightCurrentSelection(undefined, true);
        return { ok: true };
      case 'DELETE_HIGHLIGHT': {
        const id = (message.payload as { id: string }).id;
        await deleteHighlight(id);
        removeHighlightFromDom(id);
        broadcastHighlightsChanged();
        return { ok: true };
      }
      case 'UPDATE_HIGHLIGHT': {
        const payload = message.payload as {
          id: string;
          color?: HighlightColor;
          note?: string;
        };
        if (payload.color) updateHighlightColorInDom(payload.id, payload.color);
        return { ok: true };
      }
      case 'SCROLL_TO_HIGHLIGHT': {
        const id = (message.payload as { id: string }).id;
        scrollToHighlight(id);
        return { ok: true };
      }
      case 'HIGHLIGHTS_CHANGED':
        await restorePageHighlights();
        return { ok: true };
      default:
        return undefined;
    }
  };

  void handle().then(sendResponse);
  return true;
});

void bootstrap();
