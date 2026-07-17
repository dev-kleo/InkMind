export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export type PageType = 'webpage' | 'pdf';

export type ThemeMode = 'light' | 'dark' | 'system';

export type FontSize = 'small' | 'medium' | 'large';

export type ExportFormat = 'markdown' | 'json' | 'text';

export interface TextQuoteLocator {
  exact: string;
  prefix: string;
  suffix: string;
}

export interface DomLocator {
  xpath: string;
  startOffset: number;
  endOffset: number;
  quote: TextQuoteLocator;
}

export interface PdfRect {
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Highlight {
  id: string;
  url: string;
  canonicalUrl: string;
  pageTitle: string;
  text: string;
  color: HighlightColor;
  locator: DomLocator | null;
  note: string;
  tags: string[];
  collectionIds: string[];
  createdAt: number;
  updatedAt: number;
  pageType: PageType;
  pdfPageNumber?: number;
  pdfRects?: PdfRect[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface KeyboardShortcuts {
  highlightSelection: string;
  createNote: string;
  openSidebar: string;
}

export interface UserSettings {
  defaultHighlightColor: HighlightColor;
  theme: ThemeMode;
  fontSize: FontSize;
  autoBackup: boolean;
  exportFormat: ExportFormat;
  shortcuts: KeyboardShortcuts;
}

export interface HighlightFilters {
  query: string;
  colors: HighlightColor[];
  tags: string[];
  collectionId: string | null;
  pageUrl: string | null;
  hasNote: boolean | null;
}

export type MessageType =
  | 'HIGHLIGHT_SELECTION'
  | 'CREATE_NOTE'
  | 'OPEN_SIDEBAR'
  | 'DELETE_HIGHLIGHT'
  | 'UPDATE_HIGHLIGHT'
  | 'GET_PAGE_INFO'
  | 'PAGE_INFO'
  | 'HIGHLIGHTS_CHANGED'
  | 'SETTINGS_CHANGED'
  | 'SCROLL_TO_HIGHLIGHT'
  | 'SELECTION_COPIED'
  | 'PING';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface PageInfo {
  url: string;
  title: string;
  pageType: PageType;
  isPdf: boolean;
}

export interface CreateHighlightInput {
  text: string;
  color?: HighlightColor;
  note?: string;
  locator?: DomLocator | null;
  pageType?: PageType;
  pdfPageNumber?: number;
  pdfRects?: PdfRect[];
  tags?: string[];
  collectionIds?: string[];
  url?: string;
  pageTitle?: string;
}

export interface ExportOptions {
  format: ExportFormat;
  highlightIds?: string[];
  url?: string;
  collectionId?: string | null;
}

/**
 * Extension point for future AI / sync layers.
 * Phase 1 stores data locally only; these interfaces remain unused stubs.
 */
export interface FutureSyncAdapter {
  push?(highlights: Highlight[]): Promise<void>;
  pull?(): Promise<Highlight[]>;
}

export interface FutureAiAdapter {
  summarize?(highlight: Highlight): Promise<string>;
  suggestTags?(highlight: Highlight): Promise<string[]>;
}
