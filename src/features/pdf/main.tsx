import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PdfViewer } from '@/features/pdf/PdfViewer';
import '@/styles/global.css';

const params = new URLSearchParams(window.location.search);
const src = params.get('src') || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {src ? (
      <PdfViewer src={src} />
    ) : (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-ink-muted">
        Missing PDF source. Open a PDF via the KnowledgeOS popup or context menu.
      </div>
    )}
  </StrictMode>,
);
