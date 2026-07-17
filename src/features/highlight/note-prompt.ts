import { NOTE_MAX_CHARS } from '@/utils/constants';

export function promptForNote(initial = ''): Promise<string | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'kos-note-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Add note');

    const panel = document.createElement('div');
    panel.className = 'kos-note-panel';

    const title = document.createElement('h2');
    title.textContent = 'Add note';
    title.className = 'kos-note-title';

    const textarea = document.createElement('textarea');
    textarea.className = 'kos-note-textarea';
    textarea.value = initial;
    textarea.maxLength = NOTE_MAX_CHARS;
    textarea.rows = 6;
    textarea.placeholder = 'Write a markdown note…';

    const counter = document.createElement('div');
    counter.className = 'kos-note-counter';
    const updateCounter = () => {
      counter.textContent = `${textarea.value.length} / ${NOTE_MAX_CHARS}`;
    };
    updateCounter();
    textarea.addEventListener('input', updateCounter);

    const actions = document.createElement('div');
    actions.className = 'kos-note-actions';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'kos-note-btn kos-note-btn-secondary';
    cancel.textContent = 'Cancel';

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'kos-note-btn kos-note-btn-primary';
    save.textContent = 'Save note';

    const cleanup = (value: string | null) => {
      overlay.remove();
      resolve(value);
    };

    cancel.addEventListener('click', () => cleanup(null));
    save.addEventListener('click', () => cleanup(textarea.value));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) cleanup(null);
    });
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') cleanup(null);
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') cleanup(textarea.value);
    });

    actions.append(cancel, save);
    panel.append(title, textarea, counter, actions);
    overlay.append(panel);
    document.documentElement.appendChild(overlay);
    textarea.focus();
  });
}
