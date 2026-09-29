import {test as base, customMatcher} from 'playwright-advanced-har';
import {findEntry as defaultFindEntry} from 'playwright-advanced-har/lib/utils/serveFromHar';
import crypto from 'node:crypto';
import {CanonicalizedRedactedRequest} from './utils/canonicalized-redacted-request.class';
import path from 'node:path';
import {expect, type Locator, type Page, type TestInfo} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {canonicalizeUrl} from './utils/canonicalize.utils';
// WCAG 2.2 AA is a superset of the 2.0/2.1 A+AA success criteria, so all of these tags need to be
// requested to get the full rule set axe-core ships for that conformance target.
const WCAG_22_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export type CheckA11yOptions = {
  /** CSS selector(s) to scope the scan to. Useful for widgets rendered outside the main page flow, e.g. dialogs/overlays. */
  include?: string[];
  /**
   * CSS selector(s) to exclude from the scan, e.g. known third-party widgets (ArcGIS canvas/WebGL controls) that
   * can't be remediated by us. Use sparingly and document why in the call site.
   */
  exclude?: string[];
};


// URL pattern. If pattern matches,
const HAR_TARGET_PATTERN = /^https:\/\/(?!.*(?:localhost|arcgis\.com)).*$/;
const IS_WRITING_HAR = !!process.env['WRITE_HAR'];
const DEFAULT_DESKTOP_MAP_VIEW_PADDING = {top: 88, right: 180, bottom: 88, left: 474};

export type ScreenCoords = [number, number];
export type ScreenCoordsList = ScreenCoords[];

type Gb3Fixtures = {
  useHar: (postFix?: string) => Promise<void>;
  captureConsole: () => void;
  checkA11y: (options?: CheckA11yOptions) => Promise<void>;
  filterForLayer: (searchTerm: string) => Promise<void>;
  clickMapInTheList: (nameOfTheMap: string, expectedActiveMapName?: string) => Promise<void>;
  clickByDataTestId: (testId: string) => Promise<void>;
  selectTopic: (nameOfTheTopic: string) => Promise<void>;
  openUrlWithCoordinates: (x: string, y: string, shouldSkipTour?: boolean) => Promise<void>;
  login: () => Promise<void>;
  search: (searchTerm: string) => Promise<void>;
  searchAndShowResults: (searchTerm: string) => Promise<Locator>;
  zoom: (zoomLevel: number) => Promise<void>;
  clickDefaultMapViewCenter: () => Promise<void>;

  // Shared "arrange" steps reused by both the functional and the accessibility test of a given flow, so that
  // navigating to/reaching a given, meaningful UI state only needs to be described (and asserted-ready) once.
  openHomePage: () => Promise<void>;
  openAppsPage: () => Promise<void>;
  openDataCatalogueOverview: () => Promise<void>;
  openDatasetDetailPage: (datasetName: string) => Promise<void>;
  openFaqPage: () => Promise<void>;
  toggleFaqQuestion: (questionText: string) => Promise<Locator>;
  openMapWithActiveLayer: (x: string, y: string, layerName: string) => Promise<void>;
  openMapForLayerFiltering: (x: string, y: string) => Promise<void>;
  openOerebInfoRequest: (address: string) => Promise<void>;
  openPrintDialog: (x: string, y: string, layerName: string) => Promise<void>;
  openDataDownloadSelectionTools: (x: string, y: string, layerName: string) => Promise<Locator>;
  openMunicipalityDownloadDialog: (dataDownloadSelectionTools: Locator) => Promise<Locator>;
  selectMunicipalityAndContinue: (municipalityDownloadDialog: Locator, municipalityName: string) => Promise<Locator>;
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

/**
 * Renders a compact, actionable summary of axe-core violations so that failures are understandable directly from
 * the CI log/assertion message, without needing to dig into the attached JSON report.
 */
function formatViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `      - ${node.target.join(' ')}\n        ${node.failureSummary?.replace(/\n/g, '\n        ')}`)
        .join('\n');
      return `  [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
    })
    .join('\n\n');
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
      const usedFilePath = `./e2e/hars/${usedFileName}.har`;

      if (!process.env['CI']) {
        console.log(`[har] ${shouldUpdate ? 'Writing' : 'Using'} HAR file at ${usedFilePath}`);
      }

      await advancedRouteFromHAR(usedFilePath, {
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
              return canonicalizeUrl(a) === canonicalizeUrl(b);
            },
            postDataComparator: postDataEquals,
          }),
        },
        notFound: async (route) => {
          const request = route.request();
          const postData = request.postData();
          const errorMessage = `[har] No response matched ${request.method()} ${request.url()} in file ${usedFilePath}${postData ? `\n[har] Request body: ${postData.slice(0, 2_000)}` : ''}`;
          if (process.env['CI']) {
            // Hard fail if a request isn't found on the CI.
            throw new Error(errorMessage);
          } else {
            console.error(errorMessage);
            await route.abort();
          }
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

  checkA11y: async ({page}, use, testInfo: TestInfo) => {
    await use(async (options?: CheckA11yOptions) => {
      let builder = new AxeBuilder({page}).withTags(WCAG_22_AA_TAGS);

      for (const selector of options?.include ?? []) {
        builder = builder.include(selector);
      }
      for (const selector of options?.exclude ?? []) {
        builder = builder.exclude(selector);
      }

      const results = await builder.analyze();

      if (results.violations.length > 0) {
        // Only attached when there's something to debug: lets us see "incomplete" (needs manual review) results
        // and the full node list in the HTML report without re-running the scan, without paying the
        // serialization/IO cost of a full axe report (which can be sizeable) on every passing run.
        await testInfo.attach(`axe-results-${testInfo.titlePath.join('-')}`, {
          body: JSON.stringify(results, null, 2),
          contentType: 'application/json',
        });
      }

      // Assert on the count rather than the raw `violations` array: comparing the full array makes Playwright's
      // default toEqual() diff dump every axe node/object (hundreds of lines) into the console/error output on
      // top of the compact, actionable summary below, which is the only part actually needed to fix a failure.
      expect(results.violations.length, `Accessibility violations found:\n\n${formatViolations(results.violations)}`).toBe(0);
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
    await use(async (nameOfTheMap: string, expectedActiveMapName: string = nameOfTheMap) => {
      const catalogueItem = page.locator('map-data-item-map, map-data-item-favourite').filter({hasText: nameOfTheMap}).first();
      const addButton = catalogueItem.locator('button[data-test-id="add-active-map"]');
      await expect(addButton).toBeVisible({timeout: 30_000});
      await expect(addButton).toBeEnabled();
      await addButton.click();

      const activeMapItem = page.locator('active-map-item').filter({hasText: expectedActiveMapName}).first();
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

  search: async ({searchAndShowResults}, use) => {
    await use(async (searchTerm: string) => {
      const searchResult = await searchAndShowResults(searchTerm);
      await searchResult.click();
    });
  },

  searchAndShowResults: async ({page}, use) => {
    await use(async (searchTerm: string) => {
      const searchWindow = page.locator('search-window');
      const searchInput = searchWindow.getByPlaceholder('Suchen nach Adressen, Orten, Karten und mehr...');

      await expect(searchInput).toBeVisible();
      await searchInput.click();
      await searchInput.clear();
      await searchInput.pressSequentially(searchTerm);

      const searchResults = searchWindow.locator('.result-window__content');
      await expect(searchResults).toBeVisible({timeout: 30_000});

      const searchResult = searchResults.getByRole('button').filter({hasText: searchTerm}).first();
      await expect(searchResult).toBeVisible({timeout: 30_000});
      return searchResult;
    });
  },

  zoom: async ({page}, use) => {
    await use(async (zoomLevel: number) => {
      const zoomInput = page.locator('[data-test-id="input-map-scale"]');

      await expect(zoomInput).toBeVisible();
      await zoomInput.clear();
      await zoomInput.pressSequentially(zoomLevel.toString());
      await expect(zoomInput).toHaveValue(zoomLevel.toString());
    });
  },

  clickDefaultMapViewCenter: async ({page}, use) => {
    await use(async () => {
      const map = page.locator('map-page map-container .esri-view-surface');
      await expect(map).toBeVisible();

      const boundingBox = await map.boundingBox();
      expect(boundingBox).not.toBeNull();

      const {top, right, bottom, left} = DEFAULT_DESKTOP_MAP_VIEW_PADDING;
      const effectiveWidth = boundingBox!.width - left - right;
      const effectiveHeight = boundingBox!.height - top - bottom;

      await page.mouse.click(boundingBox!.x + left + effectiveWidth / 2, boundingBox!.y + top + effectiveHeight / 2);
    });
  },

  openHomePage: async ({page}, use) => {
    await use(async () => {
      await page.goto('/', {waitUntil: 'domcontentloaded'});
      await expect(page.locator('h1', {hasText: 'Geoportal'})).toBeVisible();
    });
  },

  openAppsPage: async ({page}, use) => {
    await use(async () => {
      await page.goto('/apps', {waitUntil: 'domcontentloaded'});
      await expect(page.locator('h1', {hasText: 'Apps'})).toBeVisible();
      await expect(page.locator('a', {hasText: 'Leitungskataster'})).toBeVisible();
    });
  },

  openDataCatalogueOverview: async ({page}, use) => {
    await use(async () => {
      await page.goto('/data', {waitUntil: 'domcontentloaded'});
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1', {hasText: 'Geodatenkatalog'})).toBeVisible();
    });
  },

  openDatasetDetailPage: async ({page}, use) => {
    await use(async (datasetName: string) => {
      const filterInput = page.locator('input[placeholder="Geodatensätze, GIS-Browserkarten und Geodienste filtern"]');
      await expect(filterInput).toBeVisible();
      await filterInput.fill(datasetName);
      await page.waitForLoadState('networkidle');

      const datasetLink = page.locator('a', {hasText: datasetName}).first();
      await expect(datasetLink).toBeVisible();
      await datasetLink.click();

      await expect(page).toHaveURL(/\/data\/datasets\//);
      await expect(page.locator('h1', {hasText: datasetName})).toBeVisible();
    });
  },

  openFaqPage: async ({page}, use) => {
    await use(async () => {
      await page.goto('/support/faq', {waitUntil: 'domcontentloaded'});
      await expect(page.locator('h3', {hasText: 'Allgemein'})).toBeVisible();
    });
  },

  toggleFaqQuestion: async ({page}, use) => {
    await use(async (questionText: string) => {
      const question = page.locator('cdk-accordion-item').filter({hasText: questionText});
      await expect(question).toBeVisible();

      await question.locator('.accordion-item__content__header').click();
      await expect(question).toHaveAttribute('aria-expanded', 'true');

      return question;
    });
  },

  openMapWithActiveLayer: async ({openUrlWithCoordinates, filterForLayer, clickMapInTheList}, use) => {
    await use(async (x: string, y: string, layerName: string) => {
      await openUrlWithCoordinates(x, y);
      await filterForLayer(layerName);
      await clickMapInTheList(layerName);
    });
  },

  openMapForLayerFiltering: async ({page, openUrlWithCoordinates}, use) => {
    await use(async (x: string, y: string) => {
      await openUrlWithCoordinates(x, y);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200);
    });
  },

  openOerebInfoRequest: async ({page, search}, use) => {
    await use(async (address: string) => {
      await page.goto('/maps?initialMapIds=OerebKatasterZH');
      await page.waitForLoadState('networkidle');

      await search(address);
      await page.waitForTimeout(5000); // Until the zoom is done
      const zoomInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Massstab anpassen"]');
      await expect(zoomInput).toHaveValue('750', {timeout: 30_000});

      const map = page.locator('map-page');
      await expect(map).toBeVisible();

      await map.click();
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
      await expect(page.locator('feature-info-content', {hasText: 'Markieren'})).toBeVisible();
    });
  },

  openPrintDialog: async ({page, openMapWithActiveLayer}, use) => {
    await use(async (x: string, y: string, layerName: string) => {
      await openMapWithActiveLayer(x, y, layerName);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200);

      const printDialogButton = page.locator('[data-test-id="map-print"]');
      await expect(printDialogButton).toBeVisible();

      await printDialogButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page.locator('.print-dialog')).toBeVisible();
    });
  },

  openDataDownloadSelectionTools: async ({page, openMapWithActiveLayer}, use) => {
    await use(async (x: string, y: string, layerName: string) => {
      await openMapWithActiveLayer(x, y, layerName);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200);

      const dataDownloadDialogButton = page.locator('[data-test-id="map-data-download"]');
      await expect(dataDownloadDialogButton).toBeVisible();

      await dataDownloadDialogButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const dataDownloadSelectionTools = page.locator('data-download-selection-tools');
      await expect(dataDownloadSelectionTools).toBeVisible();

      return dataDownloadSelectionTools;
    });
  },

  openMunicipalityDownloadDialog: async ({page}, use) => {
    await use(async (dataDownloadSelectionTools: Locator) => {
      const municipalityDownloadButton = dataDownloadSelectionTools.locator('[aria-label="Selektion: Auswahl einer Zürcher Gemeinde."]');
      await expect(municipalityDownloadButton).toBeVisible();
      await municipalityDownloadButton.click();

      const municipalityDownloadDialog = page.locator('api-dialog-wrapper[title="Daten beziehen"]');
      await expect(municipalityDownloadDialog).toBeVisible();

      return municipalityDownloadDialog;
    });
  },

  selectMunicipalityAndContinue: async ({page}, use) => {
    await use(async (municipalityDownloadDialog: Locator, municipalityName: string) => {
      const municipalityInput = municipalityDownloadDialog.locator('[aria-label="Gemeinde"]');
      await municipalityInput.focus();
      await municipalityInput.clear();
      await municipalityInput.fill(municipalityName);

      const selectedableOption = municipalityDownloadDialog.locator('mat-option');
      await expect(selectedableOption).toContainText(municipalityName);
      await selectedableOption.click();

      const continueButton = municipalityDownloadDialog.locator('[data-test-id="data-download-municipality-submit"]');
      await expect(continueButton).toBeVisible();
      await continueButton.click();

      await page.waitForTimeout(200);
      await expect(municipalityDownloadDialog).not.toBeVisible();
      await page.waitForLoadState('networkidle');

      const dataDownloadDialog = page.locator('data-download-dialog');
      await expect(dataDownloadDialog).toBeVisible();

      return dataDownloadDialog;
    });
  },
});

/**
 * Groups a11y-only tests so they're skipped declaratively for non-chromium projects. Unlike a `test.skip()` call
 * inside the test body (or a fixture), this is evaluated at test-collection time, before Playwright creates any
 * per-test fixtures (browser context/page, etc.), so firefox/webkit truly never pay for a browser launch here.
 */
export function describeA11y(fn: () => void): void {
  test.describe('accessibility', () => {
    test.skip(
      ({browserName}) => browserName !== 'chromium',
      'Accessibility checks only need to run once; chromium is used as the reference renderer.',
    );
    fn();
  });
}

export {expect} from '@playwright/test';
