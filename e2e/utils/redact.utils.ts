import {Header} from 'har-format';

/**
 * Keys to redact in either query strings, JSON stsructures, headers, etc.
 */
const REDACTABLE_KEYS = new Set([
  'code',
  'code_verifier',
  'access_token',
  'authorization',
  'authenticity_token',
  'user[login]',
  'user[password]',
  'user%5Blogin%5D',
  'user%5Bpassword%5D',
  'x-request-id',
  '_ts',
  'n',
  'etag',
  'kid',
  'user-agent',
  'User-Agent',
  'set-cookie',
]);

/**
 * Value to replace the actual values with.
 */
const REDACTED_VALUE = '**redacted**';

/**
 * Redacts an HTTP search string as `URLSearchParams`.
 */
function redactSearchParams(params: URLSearchParams): URLSearchParams {
  const redacted = new URLSearchParams();

  Object.entries(redactAny(Object.fromEntries(params.entries()))).forEach(([name, value]) => {
    redacted.set(name, value as string);
  });

  return redacted;
}

/**
 * Redacts a URL by redacting the query string.
 */
function redactUrl(url: string) {
  const parsed = new URL(url);
  redactSearchParams(parsed.searchParams).forEach((value, key) => {
    parsed.searchParams.set(key, value);
  });

  let redactedUrl = parsed.toString();

  if (!url.endsWith('/')) {
    while (redactedUrl.endsWith('/')) {
      redactedUrl = redactedUrl.slice(0, -1);
    }
  }

  if (url.includes('%20')) {
    redactedUrl = redactedUrl.replaceAll('+', '%20');
  }

  return redactedUrl;
}

/**
 * Checks if a given value is parsable JSON.
 */
function isJsonString(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    ((_) => {
      // noop, so SonarQube doesn't complain, we have no debug output and ESLint is happy.
    })(error);
    return false;
  }
}

/**
 * Checks if a given value looks and behaves like an HTTP query string.
 */
function isSearchParamsString(value: string) {
  if (!/^\??(?:[a-zA-Z0-9._~-]+(?:\[\])?=(?:[a-zA-Z0-9._~%-]*))(?:&[a-zA-Z0-9._~-]+(?:\[\])?=(?:[a-zA-Z0-9._~%-]*))*$/.test(value)) {
    return false;
  }

  try {
    // Last sanity check: If JS can do something with it, we're most likely good.
    new URLSearchParams(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a given value is a HAR Header list.
 */
function isHeadersList(value: unknown): value is Header[] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  const firstValueKeys = Object.keys(value[0]);

  return firstValueKeys.length === 2 && firstValueKeys.includes('name') && firstValueKeys.includes('value');
}

/**
 * Redacts a given object, string, number, etc. Differentiates between several different data types and structures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is indeed `any`. `unknown` causes more issues than it fixes, actually.
export function redactAny(v: any): any {
  if (v === true || v === false || v === null || v === undefined) {
    return v;
  }

  if (typeof v === 'string') {
    if (v.includes('Bearer')) {
      return `Bearer ${REDACTED_VALUE}`;
    }

    if (v.startsWith('https://') || v.startsWith('http://')) {
      return redactUrl(v);
    }

    if (isSearchParamsString(v)) {
      return redactSearchParams(new URLSearchParams(v)).toString();
    }

    if (isJsonString(v)) {
      return JSON.stringify(redactAny(JSON.parse(v)));
    }

    return v;
  }

  if (typeof v === 'number') {
    return v;
  }

  if (isHeadersList(v)) {
    return v.map(({name, value}) => ({
      name,
      value: REDACTABLE_KEYS.has(name) ? REDACTED_VALUE : redactAny(value),
    }));
  }

  if (Array.isArray(v)) {
    return v.map((value) => redactAny(value));
  }

  // It's not an array, number, string, true, false, null, undefined, so it _has_ to be an object.
  return Object.fromEntries(
    Object.entries(v).map(([key, value]) => {
      if (REDACTABLE_KEYS.has(key)) {
        return [key, REDACTED_VALUE];
      }

      return [key, redactAny(value)];
    }),
  );
}
