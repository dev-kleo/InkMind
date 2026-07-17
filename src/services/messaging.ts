import type { ExtensionMessage, MessageType } from '@/types';

export function sendRuntimeMessage<TPayload = unknown, TResponse = unknown>(
  type: MessageType,
  payload?: TPayload,
): Promise<TResponse> {
  return chrome.runtime.sendMessage({ type, payload } satisfies ExtensionMessage<TPayload>);
}

export function sendTabMessage<TPayload = unknown, TResponse = unknown>(
  tabId: number,
  type: MessageType,
  payload?: TPayload,
): Promise<TResponse> {
  return chrome.tabs.sendMessage(tabId, { type, payload } satisfies ExtensionMessage<TPayload>);
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export function broadcastHighlightsChanged(): void {
  void chrome.runtime.sendMessage({ type: 'HIGHLIGHTS_CHANGED' }).catch(() => {
    // No listeners is fine.
  });
}
