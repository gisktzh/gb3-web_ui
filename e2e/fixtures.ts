import {test as base, customMatcher} from 'playwright-advanced-har';
import {findEntry as defaultFindEntry} from 'playwright-advanced-har/lib/utils/serveFromHar';
import crypto from 'node:crypto';
import {CanonicalizedRedactedRequest} from './utils/canonicalized-redacted-request.class';
import path from 'node:path';
import {expect, type Page} from '@playwright/test';

// URL pattern. If pattern matches,
const HAR_TARGET_PATTERN = /^https:\/\/(?!.*(?:localhost|arcgis\.com)).*$/;
const IS_WRITING_HAR = !!process.env['WRITE_HAR'];

export type ScreenCoords = [number, number];
export type ScreenCoordsList = ScreenCoords[];

type Gb3Fixtures = {
  useHar: (postFix?: string) => Promise<void>;
  captureConsole: () => void;
  filterForLayer: (searchTerm: string) => Promise<void>;
  clickMapInTheList: (nameOfTheMap: string) => Promise<void>;
  clickByDataTestId: (testId: string) => Promise<void>;
  selectTopic: (nameOfTheTopic: string) => Promise<void>;
  openUrlWithCoordinates: (x: string, y: string, shouldSkipTour?: boolean) => Promise<void>;
  login: () => Promise<void>;
  search: (searchTerm: string) => Promise<void>;
  zoom: (zoomLevel: number) => Promise<void>;
};

function getRequestKey(url: string, method: string) {
  return crypto.createHash('sha256').update(JSON.stringify({url, method}), 'utf8').digest('hex');
}

function canonicalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJson);
  }

  if (typeof value === 'number') {
    // Browser geometry calculations can differ below the precision relevant to
    // the API while still representing the same point.
    return Math.round(value * 1_000_000) / 1_000_000;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalizeJson(child)]),
    );
  }

  return value;
}

function postDataEquals(left: string, right: string): boolean {
  try {
    return JSON.stringify(canonicalizeJson(JSON.parse(left))) === JSON.stringify(canonicalizeJson(JSON.parse(right)));
  } catch {
    return left === right;
  }
}

async function waitForMapReady(page: Page): Promise<void> {
  await expect(page.locator('map-page')).toBeVisible({timeout: 30_000});
  await expect(page.locator('map-page canvas').first()).toBeVisible({timeout: 30_000});
  await expect(page.locator('input[aria-label="Massstab anpassen"]')).not.toHaveValue('', {timeout: 30_000});
  await expect(page.locator('input[aria-label="Koordinaten eingeben"]')).not.toHaveValue('', {timeout: 30_000});
}

export const test = base.extend<Gb3Fixtures>({
  useHar: async ({advancedRouteFromHAR}, use, testInfo) => {
    const shouldUpdate = IS_WRITING_HAR;
    const fileName = path.basename(testInfo.file).split('.').at(0);

    await use(async (postFix?: string) => {
      const usedFileName = `${fileName}${postFix ? `-${postFix}` : ''}`;

      if (!process.env['CI']) {
        console.log(`[har] ${shouldUpdate ? 'Writing' : 'Using'} HAR file at ./e2e/hars/${usedFileName}.har`);
      }

      await advancedRouteFromHAR(`./e2e/hars/${usedFileName}.har`, {
        url: HAR_TARGET_PATTERN,
        update: shouldUpdate,
        updateMode: 'minimal',
        updateContent: 'embed',
        matcher: {
          async findEntry(har, request, matcher) {
            if (matcher) {
              const redactedRequest = new CanonicalizedRedactedRequest(request);

              const scoredEntries = await Promise.all(
                har.log.entries.map(async (entry) => {
                  return {
                    entry,
                    score: await matcher(redactedRequest, entry),
                  };
                }),
              );

              const candidates = scoredEntries.filter((se) => se.score >= 0).map((se) => se.entry);
              if (candidates.length === 1) {
                return candidates[0];
              }

              // Returning to a recorded map extent can request the same image more often than during recording.
              if (
                candidates.length > 1 &&
                redactedRequest.method() === 'GET' &&
                candidates.every(
                  ({response}) =>
                    response.content.mimeType.startsWith('image/') &&
                    response.status === candidates[0].response.status &&
                    JSON.stringify(response.content) === JSON.stringify(candidates[0].response.content),
                )
              ) {
                return candidates[0];
              }

              // We're dealing with several instances of the same request, so we need to figure out which one we actually want.
              // We do that by keeping a counter in the browser's session storage. The storage gets reset once the browser is closed
              // (i.e. once the tests are done), so there's no cross-run pollution.
              if (candidates.length > 1) {
                const requestKey = getRequestKey(redactedRequest.url(), redactedRequest.method());

                const requestIndex = await redactedRequest
                  .frame()
                  .evaluate(([key]) => Promise.resolve(Number.parseInt(sessionStorage.getItem(key) || '0')), [requestKey]);

                const entry = candidates[redactedRequest.method() === 'GET' ? requestIndex % candidates.length : requestIndex];
                const newRequestIndex = requestIndex + 1;

                await redactedRequest
                  .frame()
                  .evaluate(([key, index]) => sessionStorage.setItem(key, index), [requestKey, newRequestIndex.toString()]);

                if (entry) {
                  return entry;
                }
              }
            }

            return defaultFindEntry(har, request, matcher);
          },
          matchFunction: customMatcher({
            urlComparator(a, b) {
              return a === b;
            },
            postDataComparator: postDataEquals,
          }),
        },
        notFound: async (route) => {
          const request = route.request();
          const postData = request.postData();
          console.error(
            `[har] No response matched ${request.method()} ${request.url()}${postData ? `\n[har] Request body: ${postData.slice(0, 2_000)}` : ''}`,
          );
          await route.abort();
        },
      });
    });
  },

  captureConsole: async ({page}, use) => {
    await use(() => {
      page.on('console', (msg) => {
        if (msg.type() === 'error' || process.env['CAPTURE_CONSOLE']) {
          const filtered = ['Animation Frame', 'prepare', 'preRender', 'render', 'postRender', 'update', 'finish'];
          if (!filtered.includes(msg.text())) {
            console.log(`[browser ${msg.type()}]`, msg.text());
          }
        }
      });

      page.on('pageerror', (error) => console.error('[browser pageerror]', error));
      page.on('requestfailed', (request) => {
        const errorText = request.failure()?.errorText ?? 'unknown error';
        if (!/abort|cancel/i.test(errorText)) {
          console.error(`[browser requestfailed] ${request.method()} ${request.url()}: ${errorText}`);
        }
      });
    });
  },

  filterForLayer: async ({page}, use) => {
    await use(async (searchTerm) => {
      const filterInput = page.locator('input[placeholder="Karten und Layer filtern"]');
      await expect(filterInput).toBeVisible();
      // Since the search input listenes to KeyUp events, we need to actually type the search term.
      await filterInput.fill(searchTerm);
      await filterInput.dispatchEvent('keyup', {key: searchTerm.at(-1)});

      await expect(page.locator('map-data-item-map, map-data-item-favourite').filter({hasText: searchTerm}).first()).toBeVisible({
        timeout: 30_000,
      });
    });
  },

  clickMapInTheList: async ({page}, use) => {
    await use(async (nameOfTheMap: string) => {
      const catalogueItem = page.locator('map-data-item-map, map-data-item-favourite').filter({hasText: nameOfTheMap}).first();
      const addButton = catalogueItem.locator('button[data-test-id="add-active-map"]');
      await expect(addButton).toBeVisible({timeout: 30_000});
      await expect(addButton).toBeEnabled();
      await addButton.click();

      const activeMapItem = page.locator('active-map-item').filter({hasText: nameOfTheMap}).first();
      await expect(activeMapItem).toBeVisible({timeout: 30_000});
      await expect(activeMapItem.locator('mat-progress-bar')).toHaveCount(0, {timeout: 30_000});
    });
  },

  clickByDataTestId: async ({page}, use) => {
    await use(async (testId: string) => {
      const element = page.locator(`[data-test-id="${testId}"]`);
      await expect(element).toBeVisible();
      await element.click();
    });
  },

  selectTopic: async ({page}, use) => {
    await use(async (nameOfTheTopic: string) => {
      const topic = page.getByRole('button', {name: nameOfTheTopic, exact: true});
      if ((await topic.getAttribute('aria-expanded')) !== 'true') {
        await topic.click();
      }
      await expect(topic).toHaveAttribute('aria-expanded', 'true');
    });
  },

  openUrlWithCoordinates: async ({page}, use) => {
    await use(async (x: string, y: string, shouldSkipTour: boolean = true) => {
      await page.goto(`/maps?x=${x}&y=${y}&scale=251&basemap=arelkbackgroundzh`, {waitUntil: 'domcontentloaded'});
      await waitForMapReady(page);

      if (shouldSkipTour) {
        const skipButton = page.getByRole('button', {name: 'Überspringen'});
        await skipButton.waitFor({state: 'visible', timeout: 5_000}).catch(() => undefined);
        if (await skipButton.isVisible()) {
          await skipButton.click();
          await expect(skipButton).toBeHidden();
        }
      }
    });
  },

  login: async ({page}, use) => {
    await use(async () => {
      const userName = process.env['TEST_EIAM_USERNAME'] || 'some test user';
      const password = process.env['TEST_EIAM_PASSWORD'] || 'some test password';

      if (!IS_WRITING_HAR) {
        await page.route('https://maps.zh.ch/gb3/v4/auth/authorize**', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: `
              <!DOCTYPE html>
              <html>
                <body>
                  <h1>Mock Login</h1>
                  <form id="login">
                    <input id="user_login" />
                    <input id="user_password" type="password" />
                    <input type="submit" value="Login" />
                  </form>
                  <script>
                    document.getElementById('login').onsubmit = (e) => {
                      e.preventDefault();
                      const queryParams = new URLSearchParams(window.location.search)
                      window.location.href = 'http://localhost:4200/auth/login-redirect?code=asdf1234&state='+queryParams.get('state')
                    };
                  </script>
                </body>
              </html>
            `,
          });
        });
      }

      await page.getByText('Login').click();

      await page.waitForLoadState('networkidle');

      await page.locator('#user_login').fill(userName);
      await page.locator('#user_password').fill(password);
      await page.locator('input[value="Login"]').click();

      await page.waitForLoadState('networkidle');
    });
  },

  search: async ({page}, use) => {
    await use(async (searchTerm: string) => {
      const searchInput = page.locator('input[placeholder="Suchen nach Adressen, Orten, Karten und mehr..."]');

      await expect(searchInput).toBeVisible();
      await searchInput.fill(searchTerm);
      await searchInput.dispatchEvent('keyup', {key: searchTerm.at(-1)});

      const searchResult = page.locator('button', {
        hasText: searchTerm,
      });

      await expect(searchResult).toBeVisible({timeout: 30_000});
      await searchResult.click();
    });
  },

  zoom: async ({page}, use) => {
    await use(async (zoomLevel: number) => {
      const zoomInput = page.locator('[data-test-id="input-map-scale"]');

      await expect(zoomInput).toBeVisible();
      await zoomInput.fill(zoomLevel.toString());
      await expect(zoomInput).toHaveValue(zoomLevel.toString());
    });
  },
});

export {expect} from '@playwright/test';
