import 'fake-indexeddb/auto';

Object.defineProperty(globalThis, 'chrome', {
  value: {
    runtime: {
      sendMessage: () => Promise.resolve(),
      onMessage: {
        addListener: () => undefined,
        removeListener: () => undefined,
      },
      getURL: (path: string) => `chrome-extension://inkmind/${path}`,
      openOptionsPage: () => undefined,
    },
    tabs: {
      query: () => Promise.resolve([]),
      sendMessage: () => Promise.resolve(),
      create: () => Promise.resolve(),
      onUpdated: { addListener: () => undefined, removeListener: () => undefined },
      onActivated: { addListener: () => undefined, removeListener: () => undefined },
    },
    sidePanel: {
      open: () => Promise.resolve(),
      setPanelBehavior: () => Promise.resolve(),
    },
  },
  writable: true,
});
