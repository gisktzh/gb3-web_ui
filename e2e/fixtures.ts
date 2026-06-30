import {test as base, customMatcher} from 'playwright-advanced-har';
import {findEntry as defaultFindEntry} from 'playwright-advanced-har/lib/utils/serveFromHar';
import crypto from 'node:crypto';
import {CanonicalizedRedactedRequest} from './utils/canonicalized-redacted-request.class';
import path from 'node:path';
import {expect} from '@playwright/test';

// URL pattern. If pattern matches,
const HAR_TARGET_PATTERN = /^https:\/\/(?!.*(?:localhost|arcgis\.com)).*$/;
const IS_WRITING_HAR = !!process.env['WRITE_HAR'];

type Gb3Fixtures = {
  useHar: () => Promise<void>;
  captureConsole: () => void;
  filterForLayer: (searchTerm: string) => Promise<void>;
  clickMapInTheList: (nameOfTheMap: string) => Promise<void>;
  clickByDataTestId: (testId: string) => Promise<void>;
  selectTopic: (nameOfTheTopic: string) => Promise<void>;
  openUrlWithCoordinates: (x: string, y: string, shouldSkipTour?: boolean) => Promise<void>;
  login: () => Promise<void>;
  search: (searchTerm: string) => Promise<void>;
};

function getRequestKey(url: string, method: string) {
  return crypto.createHash('sha256').update(JSON.stringify({url, method}), 'utf8').digest('hex');
}

export const test = base.extend<Gb3Fixtures>({
  useHar: async ({advancedRouteFromHAR}, use, testInfo) => {
    const shouldUpdate = IS_WRITING_HAR;
    const fileName = path.basename(testInfo.file).split('.').at(0);

    await use(async () => {
      if (!process.env['CI']) {
        // eslint-disable-next-line no-console
        console.log(`[har] ${shouldUpdate ? 'Writing' : 'Using'} HAR file at ./e2e/hars/${fileName}.har`);
      }

      await advancedRouteFromHAR(`./e2e/hars/${fileName}.har`, {
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

              const candidates = scoredEntries.filter((se) => se.score > 0).map((se) => se.entry);
              if (candidates.length === 1) {
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

                const entry = candidates[requestIndex];
                const newRequestIndex = requestIndex + 1;

                await redactedRequest
                  .frame()
                  .evaluate(([key, index]) => sessionStorage.setItem(key, index), [requestKey, newRequestIndex.toString()]);

                return entry;
              }
            }

            return defaultFindEntry(har, request, matcher);
          },
          matchFunction: customMatcher({
            urlComparator(a, b) {
              return a === b;
            },
            postDataComparator(a, b) {
              return a === b;
            },
          }),
        },
      });
    });
  },

  captureConsole: async ({page}, use) => {
    await use(() => {
      page.on('console', (msg) => {
        if (process.env['CAPTURE_CONSOLE']) {
          const filtered = ['Animation Frame', 'prepare', 'preRender', 'render', 'postRender', 'update', 'finish'];
          if (!filtered.includes(msg.text())) {
            // eslint-disable-next-line no-console -- We explicitly want console output here.
            console.log('[browser console]', msg.text());
          }
        }
      });
    });
  },

  filterForLayer: async ({page}, use) => {
    await use(async (searchTerm) => {
      const filterInput = page.locator('input[placeholder="Karten und Layer filtern"]');
      await filterInput.clear();
      await page.waitForTimeout(200);
      // Since the search input listenes to KeyUp events, we need to actually type the search term.
      await filterInput.fill(searchTerm);
      await filterInput.dispatchEvent('keyup', {key: searchTerm.at(-1)});
      await page.waitForTimeout(200);
    });
  },

  clickMapInTheList: async ({page}, use) => {
    await use(async (nameOfTheMap: string) => {
      await page.locator(`span:has-text("${nameOfTheMap}") >> button[data-test-id="add-active-map"]`).first().click();
      await page.waitForLoadState('networkidle');
    });
  },

  clickByDataTestId: async ({page}, use) => {
    await use(async (testId: string) => {
      await page.locator(`[data-test-id="${testId}"]`).click();
      await page.waitForLoadState('networkidle');
    });
  },

  selectTopic: async ({page}, use) => {
    await use(async (nameOfTheTopic: string) => {
      await page.locator(`mat-expansion-panel-header:has-text("${nameOfTheTopic}")`).click();
      await page.waitForLoadState('networkidle');
    });
  },

  openUrlWithCoordinates: async ({page}, use) => {
    await use(async (x: string, y: string, shouldSkipTour: boolean = true) => {
      await page.goto(`/maps?x=${x}&y=${y}&scale=251&basemap=arelkbackgroundzh`);
      await page.waitForLoadState('networkidle');

      if (shouldSkipTour) {
        const skipButton = await page.getByText('Überspringen').all();
        if (skipButton.length === 1) {
          skipButton.at(0)?.click();
          await page.waitForLoadState('networkidle');
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

      await searchInput.focus();
      await searchInput.clear();

      await searchInput.fill(searchTerm);
      await searchInput.dispatchEvent('keyup', {key: searchTerm.at(-1)});

      await page.waitForTimeout(200);
      await page.waitForLoadState('networkidle');

      const searchResult = page.locator('button', {
        hasText: searchTerm,
      });

      await expect(searchResult).toBeVisible();
      await searchResult.click();

      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
    });
  },
});

export {expect} from '@playwright/test';
