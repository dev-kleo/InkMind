import type { ExtensionMessage } from '@/types';
import { ensureSeedData } from '@/storage/seed';
import { isPdfUrl } from '@/utils/url';

async function openSidePanel(tabId?: number): Promise<void> {
  if (typeof tabId === 'number') {
    await chrome.sidePanel.open({ tabId });
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) await chrome.sidePanel.open({ tabId: tab.id });
}

async function sendToActiveTab(message: ExtensionMessage): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, message);
  } catch {
    // Content script may be unavailable on restricted pages.
  }
}

function registerContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'kos-highlight',
      title: 'Highlight with KnowledgeOS',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: 'kos-note',
      title: 'Highlight & add note',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: 'kos-open-pdf',
      title: 'Open PDF in KnowledgeOS',
      contexts: ['page', 'link'],
      documentUrlPatterns: ['*://*/*.pdf', '*://*/*.pdf?*'],
      targetUrlPatterns: ['*://*/*.pdf', '*://*/*.pdf?*'],
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureSeedData();
  registerContextMenus();
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
});

chrome.runtime.onStartup.addListener(() => {
  void ensureSeedData();
  registerContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'kos-highlight') {
    void chrome.tabs.sendMessage(tab.id, { type: 'HIGHLIGHT_SELECTION' });
  }

  if (info.menuItemId === 'kos-note') {
    void chrome.tabs.sendMessage(tab.id, { type: 'CREATE_NOTE' });
  }

  if (info.menuItemId === 'kos-open-pdf') {
    const target = info.linkUrl || info.pageUrl;
    if (!target) return;
    const viewer = chrome.runtime.getURL(`pdf.html?src=${encodeURIComponent(target)}`);
    void chrome.tabs.create({ url: viewer });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'highlight-selection') {
    void sendToActiveTab({ type: 'HIGHLIGHT_SELECTION' });
  }
  if (command === 'create-note') {
    void sendToActiveTab({ type: 'CREATE_NOTE' });
  }
  if (command === 'open-sidebar') {
    void openSidePanel();
  }
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  const handle = async () => {
    switch (message.type) {
      case 'OPEN_SIDEBAR': {
        await openSidePanel(sender.tab?.id);
        return { ok: true };
      }
      case 'GET_PAGE_INFO': {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) return null;
        return {
          url: tab.url,
          title: tab.title ?? 'Untitled',
          pageType: isPdfUrl(tab.url) ? 'pdf' : 'webpage',
          isPdf: isPdfUrl(tab.url),
        };
      }
      case 'HIGHLIGHTS_CHANGED':
      case 'SETTINGS_CHANGED':
        // Relay to other extension pages/tabs.
        return { ok: true };
      default:
        return undefined;
    }
  };

  void handle().then(sendResponse);
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  if (isPdfUrl(tab.url) && !tab.url.startsWith(chrome.runtime.getURL('pdf.html'))) {
    // Soft hint: badge indicates PDF can be opened in KnowledgeOS viewer.
    void chrome.action.setBadgeText({ tabId, text: 'PDF' });
    void chrome.action.setBadgeBackgroundColor({ tabId, color: '#2f916c' });
  } else {
    void chrome.action.setBadgeText({ tabId, text: '' });
  }
});
