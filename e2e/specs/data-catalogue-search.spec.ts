import {type Page} from '@playwright/test';
import {test, expect} from '../fixtures';

const catalogueEntries = [
  {path: 'datasets', key: 'dataset', index: 'meta_geodatensatz', category: 'Geodatensatz'},
  {path: 'maps', key: 'map', index: 'meta_gb2karten', category: 'Karte'},
  {path: 'services', key: 'service', index: 'meta_service', category: 'Geoservice'},
  {path: 'products', key: 'product', index: 'meta_product', category: 'Produkt'},
] as const;

const contact = {
  amt: 'BLW',
  fachstelle: '',
  sektion: '',
  weburl: '',
  strassenname: '',
  postfach: '',
  email: '',
  plz: '',
  telephon: '',
  telephon_direkt: '',
  vorname: '',
  nachname: '',
  hausnummer: '',
  ortschaft: '',
};

function metadata(entry: (typeof catalogueEntries)[number]) {
  return {
    uuid: `${entry.key}-id`,
    name: `Hanglagen ${entry.category}`,
    kurzbeschreibung: 'Hanglagen im Kanton Zürich',
    beschreibung: 'Hanglagen im Kanton Zürich',
    kontakt_metadaten: contact,
    kontakt_geodaten: contact,
    ogd: true,
    abgabeformate: ['GPKG'],
    giszhnr: 1,
    gb2_id: 1,
    gdsernummer: 1,
    gdpnummer: 1,
    topic: 'test',
    image_url: null,
    datasets: [],
    maps: [],
    products: [],
    services: [],
    layers: [],
    keywords: [],
    themen: [],
    verweise: [],
    lyrs: [],
    bemerkungen: '',
    datengrundlage: '',
    datenerfassung: '',
    geogausdehnung: '',
    datenstand: '',
    nachfuehrungstyp: '',
    bearbeitungstatus: '',
    gesetzklasse: '',
    erfassungsmasstab: null,
    aufloesung: null,
    lagegenauigkeit: null,
    geobasisdaten: null,
    geocat: null,
    opendataswiss: null,
    mxd: null,
    pdf: null,
    url: null,
    gb2_url: null,
    gbkarten_internet_url: null,
    gbkarten_intranet_url: null,
    servicetyp: 'WMS',
    version: '1.3.0',
    zugang: 'Internet',
  };
}

async function selectCategory(page: Page, category: string) {
  await page.locator('data-catalogue-overview').getByRole('button', {name: 'Filter', exact: true}).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', {name: 'Kategorie', exact: true}).click();
  await dialog.getByRole('checkbox', {name: category, exact: true}).check();
  await dialog.getByRole('button', {name: 'Schliessen'}).click();
}

async function expectSearch(page: Page, term: string, count: number, category?: string) {
  const overview = page.locator('data-catalogue-overview');
  await expect(overview.getByRole('textbox')).toHaveValue(term);
  await expect(overview.locator('overview-search-result-item')).toHaveCount(count);
  await expect(overview.locator('.data-catalogue-overview__content__active-filters__result-size')).toHaveText(
    `${count} ${count === 1 ? 'Resultat' : 'Resultate'}`,
  );
  await expect(overview.locator('mat-chip-row')).toHaveCount(category ? 1 : 0);
  if (category) {
    await expect(overview.locator('mat-chip-row')).toContainText(category);
  }
}

test.describe('Data catalogue search navigation', () => {
  test.beforeEach(async ({page, captureConsole}) => {
    captureConsole();
    // Reuse recorded portal startup responses; catalogue requests use small deterministic fixtures.
    await page.routeFromHAR('./e2e/hars/overview-page.har', {url: /^https:\/\//});
    await page.route('https://js.arcgis.com/**/pe-wasm.wasm', (route) =>
      route.fulfill({path: 'node_modules/@arcgis/core/assets/esri/geometry/support/pe-wasm.wasm', contentType: 'application/wasm'}),
    );
    await page.route('https://maps.zh.ch/gb3/v4/metadata/**', async (route) => {
      const segments = new URL(route.request().url()).pathname.split('/');
      const entry = catalogueEntries.find((item) => item.path === segments[4]);
      if (!entry) {
        throw new Error(`Unexpected catalogue request: ${route.request().url()}`);
      }
      if (segments[5]) {
        await route.fulfill({json: {[entry.key]: metadata(entry)}});
      } else {
        const items = [metadata(entry)];
        if (entry.path === 'datasets') {
          items.push({...metadata(entry), uuid: 'unrelated-id', name: 'Andere Geodaten'});
        }
        await route.fulfill({json: {[entry.path]: items}});
      }
    });
    await page.route('https://maps.zh.ch/gb3/v4/search?**', async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const term = (params.get('term') ?? '').trim().toLowerCase();
      const indexes = params.get('indexes')?.split(',') ?? [];
      await route.fulfill({
        json: catalogueEntries
          .filter((entry) => indexes.includes(entry.index))
          .map((entry) => ({
            index: entry.index,
            matches: metadata(entry).name.toLowerCase().includes(term) ? [{uuid: `${entry.key}-id`, score: 1}] : [],
          })),
      });
    });
  });

  for (const entry of catalogueEntries) {
    test(`restores search criteria after returning from a ${entry.path} detail`, async ({page}) => {
      let searchRequests = 0;
      page.on('request', (request) => {
        if (new URL(request.url()).pathname === '/gb3/v4/search') {
          searchRequests++;
        }
      });
      await page.goto('/data');
      await expectSearch(page, '', 5);
      await page.locator('data-catalogue-overview').getByRole('textbox').fill('hanglagen');
      await expectSearch(page, 'hanglagen', 4);
      await selectCategory(page, entry.category);
      await expectSearch(page, 'hanglagen', 1, entry.category);
      const requestsBeforeNavigation = searchRequests;
      const openResult = () => page.locator('overview-search-result-item').getByRole('link').click();
      const expectDetail = () => expect(page.getByRole('heading', {name: `Hanglagen ${entry.category}`, exact: true})).toBeVisible();

      await openResult();
      await expectDetail();
      await page.getByRole('link', {name: 'Zur Übersicht'}).click();
      await expectSearch(page, 'hanglagen', 1, entry.category);

      await openResult();
      await expectDetail();
      await page.goBack();
      await expectSearch(page, 'hanglagen', 1, entry.category);
      await page.goForward();
      await expectDetail();
      await page.goBack();
      await expectSearch(page, 'hanglagen', 1, entry.category);

      // A manual edit also waits for the debounce, so this checks restoration did not trigger a search.
      await page.locator('data-catalogue-overview').getByRole('textbox').fill('hang');
      await expect.poll(() => searchRequests).toBe(requestsBeforeNavigation + 1);
      await expectSearch(page, 'hang', 1, entry.category);
    });
  }

  for (const openDetail of [false, true]) {
    test(`resets search criteria on reload ${openDetail ? 'of a detail' : 'of the overview'}`, async ({page}) => {
      await page.goto('/data');
      await page.locator('data-catalogue-overview').getByRole('textbox').fill('hanglagen');
      await expectSearch(page, 'hanglagen', 4);
      await selectCategory(page, 'Geodatensatz');
      await expectSearch(page, 'hanglagen', 1, 'Geodatensatz');
      if (openDetail) {
        await page.locator('overview-search-result-item').getByRole('link').click();
        await expect(page.getByRole('heading', {name: 'Hanglagen Geodatensatz', exact: true})).toBeVisible();
      }

      await page.reload();
      if (openDetail) {
        await page.getByRole('link', {name: 'Zur Übersicht'}).click();
      }
      await expectSearch(page, '', 5);
    });

    test(`resets search criteria on a portal tab change ${openDetail ? 'from a detail' : 'from the overview'}`, async ({page}) => {
      await page.goto('/data');
      await page.locator('data-catalogue-overview').getByRole('textbox').fill('hanglagen');
      await expectSearch(page, 'hanglagen', 4);
      await selectCategory(page, 'Geodatensatz');
      await expectSearch(page, 'hanglagen', 1, 'Geodatensatz');
      if (openDetail) {
        await page.locator('overview-search-result-item').getByRole('link').click();
        await expect(page.getByRole('heading', {name: 'Hanglagen Geodatensatz', exact: true})).toBeVisible();
      }

      await page.getByRole('navigation', {name: 'Hauptnavigation'}).getByRole('link', {name: 'Apps', exact: true}).click();
      await expect(page).toHaveURL(/\/apps$/);
      await page.goBack();
      if (openDetail) {
        await page.getByRole('link', {name: 'Zur Übersicht'}).click();
      }
      await expectSearch(page, '', 5);

      await page.getByRole('navigation', {name: 'Hauptnavigation'}).getByRole('link', {name: 'Geoportal', exact: true}).click();
      await expect(page.locator('start-page')).toBeVisible();
      await page.getByRole('navigation', {name: 'Hauptnavigation'}).getByRole('link', {name: 'Geodatenkatalog', exact: true}).click();
      await expectSearch(page, '', 5);
    });
  }

  test('clears the term and filters independently and allows the same term to be searched again', async ({page}) => {
    await page.goto('/data');
    const overview = page.locator('data-catalogue-overview');
    await overview.getByRole('textbox').fill('hanglagen');
    await expectSearch(page, 'hanglagen', 4);
    await selectCategory(page, 'Geodatensatz');
    await expectSearch(page, 'hanglagen', 1, 'Geodatensatz');

    await overview.getByRole('button', {name: 'Sucheingabe löschen'}).click();
    await expectSearch(page, '', 2, 'Geodatensatz');
    await overview.getByRole('textbox').fill('hanglagen');
    await expectSearch(page, 'hanglagen', 1, 'Geodatensatz');

    await overview.getByRole('button', {name: 'Filter', exact: true}).click();
    await page.getByRole('dialog').getByRole('button', {name: 'Zurücksetzen'}).click();
    await page.getByRole('dialog').getByRole('button', {name: 'Schliessen'}).click();
    await expectSearch(page, 'hanglagen', 4);
  });

  test('starts without search criteria when a detail is opened directly', async ({page}) => {
    await page.goto('/data/datasets/dataset-id');
    await expect(page.getByRole('heading', {name: 'Hanglagen Geodatensatz', exact: true})).toBeVisible();
    await page.getByRole('link', {name: 'Zur Übersicht'}).click();
    await expectSearch(page, '', 5);
  });
});
