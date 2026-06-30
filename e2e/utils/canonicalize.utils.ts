import {Har, Header} from 'har-format';

/**
 * Transforms a POJO into a `Header[]` structure.
 */
export function toHeaders(target: {[key: string]: string}): Header[] {
  return Object.entries(target).map(([name, value]) => ({name, value}));
}

/**
 * Transforms a `Header` structure into a POJO.
 */
export function fromHeaders(target: Header[]): {[key: string]: string} {
  return Object.fromEntries(target.map(({name, value}) => [name, value]));
}

/**
 * Canonicalizes a single HAR entry's request headers.
 */
export function canonicalizeHeaders(headers: Header[]): Header[] {
  return headers
    .filter(({name}) => name !== 'priority' && !name.startsWith(':') && !name.startsWith('sec-') && !name.startsWith('accept-'))
    .map(({name, value}) => ({
      name: name.toLowerCase(),
      value,
    }));
}

/**
 * Canonicalizes all HAR entries in-place.
 */
export function canonicalizeHar(har: Har): Har {
  if (!har?.log?.entries) return har;

  for (const entry of har.log.entries) {
    if (Array.isArray(entry.request?.headers)) {
      entry.request.headers = canonicalizeHeaders(entry.request.headers);
    }
  }

  return har;
}
