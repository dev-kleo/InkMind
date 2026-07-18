import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json';

const { version, description } = packageJson;

export default defineManifest({
  manifest_version: 3,
  name: 'InkMind',
  version,
  description,
  icons: {
    '16': 'public/icons/icon-16.png',
    '32': 'public/icons/icon-32.png',
    '48': 'public/icons/icon-48.png',
    '128': 'public/icons/icon-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_title: 'InkMind',
    default_icon: {
      '16': 'public/icons/icon-16.png',
      '32': 'public/icons/icon-32.png',
      '48': 'public/icons/icon-48.png',
    },
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  options_ui: {
    page: 'options.html',
    open_in_tab: true,
  },
  side_panel: {
    default_path: 'sidepanel.html',
  },
  permissions: ['storage', 'sidePanel', 'contextMenus', 'activeTab', 'scripting', 'tabs'],
  host_permissions: ['<all_urls>'],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      css: ['src/content/content.css'],
      run_at: 'document_idle',
      all_frames: false,
    },
  ],
  commands: {
    'highlight-selection': {
      suggested_key: {
        default: 'Ctrl+Shift+H',
        mac: 'Command+Shift+H',
      },
      description: 'Highlight the current selection',
    },
    'create-note': {
      suggested_key: {
        default: 'Ctrl+Shift+N',
        mac: 'Command+Shift+N',
      },
      description: 'Create a note for the current selection',
    },
    'open-sidebar': {
      suggested_key: {
        default: 'Ctrl+Shift+S',
        mac: 'Command+Shift+S',
      },
      description: 'Open the InkMind sidebar',
    },
  },
  web_accessible_resources: [
    {
      resources: ['pdf.html', 'assets/*', 'public/icons/*'],
      matches: ['<all_urls>'],
    },
  ],
});
