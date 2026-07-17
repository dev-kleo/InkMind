import type { DomLocator, TextQuoteLocator } from '@/types';

function getXPathForNode(node: Node): string {
  if (node.nodeType === Node.DOCUMENT_NODE) return '/';
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentNode;
    if (!parent) return '';
    const textIndex =
      Array.from(parent.childNodes)
        .filter((child) => child.nodeType === Node.TEXT_NODE)
        .indexOf(node as ChildNode) + 1;
    return `${getXPathForNode(parent)}/text()[${textIndex}]`;
  }

  const element = node as Element;
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const parent = element.parentNode;
  if (!parent) return `/${element.tagName.toLowerCase()}`;

  const siblings = Array.from(parent.childNodes).filter(
    (child) =>
      child.nodeType === Node.ELEMENT_NODE &&
      (child as Element).tagName === element.tagName,
  );
  const index = siblings.indexOf(element) + 1;
  return `${getXPathForNode(parent)}/${element.tagName.toLowerCase()}[${index}]`;
}

function surroundingText(textNode: Text, offset: number, radius = 32): TextQuoteLocator {
  const value = textNode.data;
  const start = Math.max(0, offset - radius);
  const end = Math.min(value.length, offset + radius);
  return {
    exact: '',
    prefix: value.slice(start, offset),
    suffix: value.slice(offset, end),
  };
}

export function buildLocatorFromRange(range: Range): DomLocator | null {
  const text = range.toString().trim();
  if (!text) return null;

  const startContainer = range.startContainer;
  const endContainer = range.endContainer;
  if (startContainer.nodeType !== Node.TEXT_NODE) {
    return {
      xpath: getXPathForNode(range.commonAncestorContainer),
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      quote: {
        exact: text,
        prefix: '',
        suffix: '',
      },
    };
  }

  const startQuote = surroundingText(startContainer as Text, range.startOffset);
  const endQuote =
    endContainer.nodeType === Node.TEXT_NODE
      ? surroundingText(endContainer as Text, range.endOffset)
      : { prefix: '', suffix: '', exact: '' };

  return {
    xpath: getXPathForNode(startContainer),
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    quote: {
      exact: text,
      prefix: startQuote.prefix,
      suffix: endQuote.suffix || startQuote.suffix,
    },
  };
}

function resolveXPath(xpath: string): Node | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    return result.singleNodeValue;
  } catch {
    return null;
  }
}

function findTextByQuote(quote: TextQuoteLocator): Range | null {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;

  while (node) {
    const index = node.data.indexOf(quote.exact);
    if (index !== -1) {
      const before = node.data.slice(Math.max(0, index - quote.prefix.length), index);
      const after = node.data.slice(
        index + quote.exact.length,
        index + quote.exact.length + quote.suffix.length,
      );
      const prefixOk = !quote.prefix || before.endsWith(quote.prefix) || before.includes(quote.prefix);
      const suffixOk = !quote.suffix || after.startsWith(quote.suffix) || after.includes(quote.suffix);

      if (prefixOk && suffixOk) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + quote.exact.length);
        return range;
      }
    }
    node = walker.nextNode() as Text | null;
  }

  // Fallback: first exact match across concatenated text nodes via body text search
  if (!quote.exact) return null;
  const bodyText = document.body.innerText;
  if (!bodyText.includes(quote.exact)) return null;

  const fallbackWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let fallbackNode = fallbackWalker.nextNode() as Text | null;
  while (fallbackNode) {
    const idx = fallbackNode.data.indexOf(quote.exact);
    if (idx !== -1) {
      const range = document.createRange();
      range.setStart(fallbackNode, idx);
      range.setEnd(fallbackNode, idx + quote.exact.length);
      return range;
    }
    fallbackNode = fallbackWalker.nextNode() as Text | null;
  }

  return null;
}

export function resolveLocatorToRange(locator: DomLocator): Range | null {
  const byQuote = findTextByQuote(locator.quote);
  if (byQuote) return byQuote;

  const node = resolveXPath(locator.xpath);
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;

  const textNode = node as Text;
  const start = Math.min(locator.startOffset, textNode.data.length);
  const end = Math.min(
    Math.max(locator.endOffset, start),
    textNode.data.length,
  );

  try {
    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    return range;
  } catch {
    return null;
  }
}
