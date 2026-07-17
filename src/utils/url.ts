/**
 * Normalize URLs so the same document maps to one storage key.
 * Strips hash and common tracking query params.
 */
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
]);

export function canonicalUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    url.hash = '';

    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function isPdfUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.pathname.toLowerCase().endsWith('.pdf') || url.searchParams.has('pdf');
  } catch {
    return /\.pdf($|\?)/i.test(rawUrl);
  }
}

export function displayHost(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
}
