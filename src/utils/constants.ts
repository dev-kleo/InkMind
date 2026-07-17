import type { HighlightColor, Tag, UserSettings } from '@/types';

export const APP_NAME = 'KnowledgeOS';
export const DB_NAME = 'knowledge-os';
export const DB_VERSION = 1;

export const HIGHLIGHT_COLORS: Record<
  HighlightColor,
  { label: string; bg: string; border: string; text: string }
> = {
  yellow: {
    label: 'Yellow',
    bg: 'rgba(250, 204, 21, 0.45)',
    border: '#ca8a04',
    text: '#713f12',
  },
  green: {
    label: 'Green',
    bg: 'rgba(74, 222, 128, 0.4)',
    border: '#16a34a',
    text: '#14532d',
  },
  blue: {
    label: 'Blue',
    bg: 'rgba(96, 165, 250, 0.4)',
    border: '#2563eb',
    text: '#1e3a8a',
  },
  pink: {
    label: 'Pink',
    bg: 'rgba(244, 114, 182, 0.4)',
    border: '#db2777',
    text: '#831843',
  },
  orange: {
    label: 'Orange',
    bg: 'rgba(251, 146, 60, 0.45)',
    border: '#ea580c',
    text: '#7c2d12',
  },
};

export const HIGHLIGHT_COLOR_LIST = Object.keys(HIGHLIGHT_COLORS) as HighlightColor[];

export const DEFAULT_SETTINGS: UserSettings = {
  defaultHighlightColor: 'yellow',
  theme: 'system',
  fontSize: 'medium',
  autoBackup: false,
  exportFormat: 'markdown',
  shortcuts: {
    highlightSelection: 'Ctrl+Shift+H',
    createNote: 'Ctrl+Shift+N',
    openSidebar: 'Ctrl+Shift+S',
  },
};

export const DEFAULT_TAGS: Omit<Tag, 'id' | 'createdAt'>[] = [
  { name: 'AI', color: '#0ea5e9' },
  { name: 'Research', color: '#8b5cf6' },
  { name: 'Important', color: '#ef4444' },
  { name: 'Exam', color: '#f59e0b' },
  { name: 'Work', color: '#10b981' },
];

export const DEFAULT_COLLECTIONS = [
  { name: 'Machine Learning', description: 'ML papers, notes, and references' },
  { name: 'University', description: 'Course material and study notes' },
  { name: 'Research Papers', description: 'Academic reading' },
  { name: 'Finance', description: 'Markets, investing, and personal finance' },
  { name: 'Programming', description: 'Code, docs, and engineering notes' },
];

export const NOTE_MAX_CHARS = 5000;
export const SEARCH_DEBOUNCE_MS = 200;
export const TOOLBAR_HIDE_DELAY_MS = 4000;
export const HIGHLIGHT_ATTR = 'data-kos-highlight-id';
export const TOOLBAR_ROOT_ID = 'kos-floating-toolbar-root';
export const CONTENT_STYLE_ID = 'kos-content-styles';

export const FONT_SIZE_MAP = {
  small: '13px',
  medium: '14px',
  large: '16px',
} as const;

export const MESSAGE_TYPES = {
  HIGHLIGHT_SELECTION: 'HIGHLIGHT_SELECTION',
  CREATE_NOTE: 'CREATE_NOTE',
  OPEN_SIDEBAR: 'OPEN_SIDEBAR',
  DELETE_HIGHLIGHT: 'DELETE_HIGHLIGHT',
  UPDATE_HIGHLIGHT: 'UPDATE_HIGHLIGHT',
  GET_PAGE_INFO: 'GET_PAGE_INFO',
  PAGE_INFO: 'PAGE_INFO',
  HIGHLIGHTS_CHANGED: 'HIGHLIGHTS_CHANGED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  SCROLL_TO_HIGHLIGHT: 'SCROLL_TO_HIGHLIGHT',
  SELECTION_COPIED: 'SELECTION_COPIED',
  PING: 'PING',
} as const;
