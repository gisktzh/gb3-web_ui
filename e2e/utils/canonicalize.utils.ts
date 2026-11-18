import {Har, Header} from 'har-format';

const COORDINATE_KEYS = ['x', 'y'];
const GEOMETRY_KEYS = ['geometry'];
const COORDINATE_DECIMAL_PLACES = 8;
// Webkit, Firefox and Chrome have slightly different polygon position calculations when creating circles.
// This leads to a mismatch of URLs because the polygon coordinates differ in the last two integer digits.
const GEOMETRY_DECIMAL_PLACES = -3;

/**
 * Rounds a given coordinate to the configured number of places.
 */
function roundCoordinate(value: string, places: number): string {
  const coordinate = Number(value);
  if (Number.isFinite(coordinate)) {
    // `Math.round` may give false negatives when we're trying to match, say `2681921.64` against `2681921.46`.
    const rounded = Math.floor(Number(coordinate) * 10 ** places) / 10 ** places;
    if (places > 0) {
      return rounded.toFixed(places);
    }
    return rounded.toString();
  }

  return '';
}

/**
 * Rounds a given WKT string's coordinates to the configured number of places.
 */
function roundWktString(wkt: string): string {
  return wkt.replaceAll(/-?\d+(?:\.\d+)?/g, (coord) => {
    const rounded = roundCoordinate(coord, GEOMETRY_DECIMAL_PLACES);
    return rounded;
  });
}

/**
 * Removes insignificant floating-point noise from map coordinates before comparing request URLs.
 */
export function canonicalizeUrl(url: string, roundingPrecisionOverwrite?: number): string {
  const parsedUrl = new URL(url);

  for (const coordinateKey of COORDINATE_KEYS) {
    const value = parsedUrl.searchParams.get(coordinateKey);
    if (value === null) {
      continue;
    }

    const rounded = roundCoordinate(value, roundingPrecisionOverwrite ?? COORDINATE_DECIMAL_PLACES);
    if (rounded !== '') {
      parsedUrl.searchParams.set(coordinateKey, rounded);
    }
  }

  for (const geometryKey of GEOMETRY_KEYS) {
    const value = parsedUrl.searchParams.get(geometryKey);

    if (value === null) {
      continue;
    }

    parsedUrl.searchParams.set(geometryKey, roundWktString(value));
  }

  // It's possible that two different test runs can produce slightly different bboxes in the @arcgis/core map implementation.
  // We normalize it to something generic, so the bbox isn't what's necessary to match a WMS request.
  if (parsedUrl.searchParams.get('bbox')) {
    parsedUrl.searchParams.set('bbox', '1,1,2,2');
  }

  return parsedUrl.toString();
}

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
