import { describe, expect, it } from 'vitest';
import { canonicalUrl, displayHost, isPdfUrl } from '@/utils/url';

describe('canonicalUrl', () => {
  it('strips hash and tracking params', () => {
    expect(
      canonicalUrl('https://example.com/article?utm_source=x&id=1#section'),
    ).toBe('https://example.com/article?id=1');
  });
});

describe('isPdfUrl', () => {
  it('detects pdf paths', () => {
    expect(isPdfUrl('https://cdn.example.com/paper.pdf')).toBe(true);
    expect(isPdfUrl('https://example.com/page')).toBe(false);
  });
});

describe('displayHost', () => {
  it('removes www prefix', () => {
    expect(displayHost('https://www.example.com/a')).toBe('example.com');
  });
});
