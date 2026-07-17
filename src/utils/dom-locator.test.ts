import { describe, expect, it } from 'vitest';
import { buildLocatorFromRange, resolveLocatorToRange } from '@/utils/dom-locator';

describe('dom-locator', () => {
  it('builds and resolves a quote locator for selected text', () => {
    document.body.innerHTML = '<p id="p">Hello knowledge world</p>';
    const textNode = document.querySelector('#p')!.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 6);
    range.setEnd(textNode, 15);

    const locator = buildLocatorFromRange(range);
    expect(locator?.quote.exact).toBe('knowledge');

    const resolved = resolveLocatorToRange(locator!);
    expect(resolved?.toString()).toBe('knowledge');
  });
});
