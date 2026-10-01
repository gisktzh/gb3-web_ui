import {test, expect} from '../fixtures';
import type {TopicsListData, TopicsStatisticInfoListData} from '../../src/app/shared/models/gb3-api-generated.interfaces';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {Har} from 'har-format';
import type {MapService} from '../../src/app/map/interfaces/map.service';
import {InternalDrawingLayer} from '../../src/app/shared/enums/drawing-layer.enum';

test.describe('OEREB-Kataster', () => {
  test('opens the OEREB-Kataster and searches for a specific address, returning its data in the info request', async ({
    page,
    search,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await page.goto('/maps?initialMapIds=OerebKatasterZH');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    await search('Weststrasse 49, 8003');
    await page.waitForTimeout(5000); // Until the zoom is done

    const map = page.locator('map-page');
    await expect(map).toBeVisible();

    await map.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
    await expect(page.locator('feature-info-content', {hasText: 'Markieren'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'BFSNr'}).locator('xpath=following-sibling::td')).toContainText('261');
    await expect(page.locator('th', {hasText: 'Nummer'}).locator('xpath=following-sibling::td')).toContainText('WD4055');
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH179170449958');
    await expect(page.locator('th', {hasText: 'Vollstaendigkeit'}).locator('xpath=following-sibling::td')).toContainText('Vollstaendig');
    await expect(page.locator('th', {hasText: 'Fläche'}).locator('xpath=following-sibling::td')).toContainText('544');
    await expect(page.locator('button', {hasText: 'Info drucken'})).toBeVisible();
  });

  test('switches between feature and statistics results in the mobile info bottom sheet', async ({page, useHar, captureConsole}) => {
    await page.setViewportSize({width: 390, height: 844});
    await useHar();
    const har: Har = JSON.parse(readFileSync(join('e2e', 'hars', 'open-oereb-kataster.har'), 'utf8'));
    const topicsEntry = har.log.entries.find((entry) => entry.request.url.endsWith('/gb3/v4/topics'));
    if (!topicsEntry?.response.content.text) {
      throw new Error('The OEREB HAR must include the topics catalogue.');
    }
    const catalogue: TopicsListData = JSON.parse(topicsEntry.response.content.text);
    const template = catalogue.categories.flatMap((category) => category.topics).find((topic) => topic.topic === 'OerebKatasterZH');
    if (!template) {
      throw new Error('The topics fixture must include OerebKatasterZH.');
    }
    catalogue.categories[0].topics.push({
      ...template,
      topic: 'StatBeschaeftigteZH',
      title: 'Beschäftigtenstatistik',
      geolion_karten_uuid: null,
      filterConfigurations: null,
      min_scale: null,
      layers: [
        {
          ...template.layers[0],
          id: 999999,
          layer: 'stat-ent-p',
          title: 'Beschäftigte',
          min_scale: 0,
          max_scale: 10000000,
          initially_visible: true,
          queryable: false,
        },
      ],
    });
    await page.route('**/gb3/v4/topics', (route) => route.fulfill({json: catalogue}));
    await page.route('**/topics/StatBeschaeftigteZH/legend?**', (route) =>
      route.fulfill({
        json: {legend: {topic: 'StatBeschaeftigteZH', geolion_gdd: null, geolion_karten_uuid: null, layers: []}},
      }),
    );
    let statisticsRequests = 0;
    let featureRequests = 0;
    let highlightCoordinates: number[][] = [];
    const statisticsHighlights = () =>
      page.evaluate((layer) => {
        const element = document.querySelector('map-container');
        if (!element) {
          throw new Error('The map container must be present to inspect its rendered highlights.');
        }
        const angular = (
          window as Window & {
            ng?: {getComponent(element: Element): {mapService: MapService}};
          }
        ).ng;
        if (!angular) {
          throw new Error('Angular development helpers must be available to inspect rendered map graphics.');
        }
        return angular
          .getComponent(element)
          .mapService.getInternalDrawingLayerGraphics(layer)
          .map(({geometry}) => geometry);
      }, InternalDrawingLayer.StatisticsHighlight);
    page.on('request', (request) => {
      if (request.url().includes('/feature_info?')) {
        featureRequests++;
      }
    });
    await page.route('**/topics/StatBeschaeftigteZH/statistic_info?**', (route) => {
      statisticsRequests++;
      const url = new URL(route.request().url());
      const positions = Array.from(url.searchParams.get('geometry')!.matchAll(/([-\d.e+]+)\s+([-\d.e+]+)/gi), ([, x, y]) => [
        Number(x),
        Number(y),
      ]);
      if (positions.length === 0) {
        throw new Error('The statistics query must include a polygon selection.');
      }
      const x = (Math.min(...positions.map(([x]) => x)) + Math.max(...positions.map(([x]) => x))) / 2;
      const y = (Math.min(...positions.map(([, y]) => y)) + Math.max(...positions.map(([, y]) => y))) / 2;
      highlightCoordinates = [
        [x - 20, y + 20],
        [x + 20, y - 20],
      ];
      expect(url.searchParams.get('field')).toBe(
        'ganzwhg,efh,wohn_m_n,geb_m_w,mfh,geb_o_w,prov_geb,andere_geb,anz_einw,anz_vzae,anz_besch',
      );
      return route.fulfill({
        json: {
          statistic_info: {
            topic: 'StatBeschaeftigteZH',
            topic_title: 'Beschäftigtenstatistik im ausgewählten Gebiet',
            geolion_karten_uuid: null,
            layer: 'stat-ent-p',
            layer_title: 'Beschäftigte',
            geolion_geodatensatz_uuid: null,
            fields: ['anz_besch', 'anz_vzae', 'efh'],
            statistic: 'sum',
            geometry: url.searchParams.get('geometry')!,
            srid: Number(url.searchParams.get('srid')),
            feature_geometry: {
              type: 'GeometryCollection',
              geometries: [
                {type: 'Point', coordinates: highlightCoordinates[0]},
                {
                  type: 'GeometryCollection',
                  geometries: [
                    {type: 'Point', coordinates: highlightCoordinates[1]},
                    {type: 'Point', coordinates: highlightCoordinates[0]},
                  ],
                },
              ],
            },
            results: {
              anz_besch: {alias: 'Anzahl Beschäftigte', value: 42, count: 3},
              anz_vzae: {alias: 'Vollzeitäquivalente', value: 35.5, count: 3},
              efh: {alias: 'Einfamilienhäuser', value: 3, count: 3},
            },
          },
        } satisfies TopicsStatisticInfoListData,
      });
    });
    captureConsole();

    await page.goto('/maps?initialMapIds=OerebKatasterZH,StatBeschaeftigteZH');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    const searchTerm = 'Weststrasse 49, 8003';
    const searchInput = page.locator('search-bar input[placeholder="Suchen nach Adressen, Orten, Karten und mehr..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(searchTerm);
    await searchInput.dispatchEvent('keyup', {key: searchTerm.at(-1)});
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    const searchResult = page.locator('search-window-mobile button', {hasText: searchTerm});
    await expect(searchResult).toBeVisible();
    await searchResult.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Until the zoom is done

    const map = page.locator('map-container');
    await expect(map).toBeVisible();

    await map.click();
    await page.waitForLoadState('networkidle');

    const bottomSheet = page.locator('bottom-sheet-overlay');
    const featuresTab = bottomSheet.getByRole('tab', {name: 'Features'});
    const statisticsTab = bottomSheet.getByRole('tab', {name: 'Statistik'});

    await expect(featuresTab).toBeVisible();
    await expect(statisticsTab).toBeVisible();
    await expect(featuresTab).toHaveAttribute('aria-selected', 'true');
    await expect(bottomSheet.locator('feature-info')).toBeVisible();
    expect(statisticsRequests).toBe(0);

    await statisticsTab.click();

    await expect(statisticsTab).toHaveAttribute('aria-selected', 'true');
    await expect(featuresTab).toHaveAttribute('aria-selected', 'false');
    await expect(bottomSheet.locator('statistics')).toBeVisible();
    await expect(bottomSheet.getByText('Beschäftigtenstatistik im ausgewählten Gebiet')).toBeVisible();
    await expect(bottomSheet.getByText('Anzahl Beschäftigte', {exact: true})).toBeVisible();
    await expect(bottomSheet.getByText('Summe', {exact: true})).toBeVisible();
    expect(statisticsRequests).toBe(1);
    await expect.poll(statisticsHighlights).toEqual([]);
    const markHeader = bottomSheet.locator('statistics-item th', {hasText: 'Markieren:'});
    const markRadio = bottomSheet.locator('statistics-item input[type="radio"]');
    await markHeader.hover();
    await expect(markRadio).toBeChecked();
    await expect.poll(statisticsHighlights).toEqual(highlightCoordinates.map((coordinates) => ({type: 'Point', coordinates, srs: 2056})));
    await page.mouse.move(0, 0);
    await expect(markRadio).not.toBeChecked();
    await expect.poll(statisticsHighlights).toEqual([]);
    const statisticsValue = bottomSheet.locator('statistics-item td').first();
    await statisticsValue.hover();
    await expect.poll(statisticsHighlights).toEqual(highlightCoordinates.map((coordinates) => ({type: 'Point', coordinates, srs: 2056})));
    await featuresTab.click();
    await statisticsTab.click();
    await expect.poll(statisticsHighlights).toEqual([]);
    expect(statisticsRequests).toBe(1);
    await markHeader.hover();
    await markHeader.click();
    await page.mouse.move(0, 0);
    await expect(markRadio).toBeChecked();
    await expect.poll(statisticsHighlights).toEqual(highlightCoordinates.map((coordinates) => ({type: 'Point', coordinates, srs: 2056})));
    const previousFeatureRequests = featureRequests;
    const radius = bottomSheet.locator('#statistics-radius-input');
    await radius.fill('1000');
    await radius.blur();
    await expect.poll(() => statisticsRequests).toBe(2);
    await expect.poll(statisticsHighlights).toEqual([]);
    await expect(markRadio).not.toBeChecked();
    expect(featureRequests).toBe(previousFeatureRequests);
    await radius.fill('4000');
    await radius.blur();
    await expect(radius).toHaveAttribute('aria-invalid', 'true');
    await expect(bottomSheet.locator('#statistics-radius-error')).toBeVisible();
    expect(statisticsRequests).toBe(2);
    await radius.fill('500');
    await radius.blur();
    await expect.poll(() => statisticsRequests).toBe(3);
    await expect(bottomSheet.locator('#statistics-radius-error')).toHaveCount(0);
    await expect.poll(statisticsHighlights).toEqual([]);
    await markHeader.hover();
    await markRadio.press('Space');
    await page.mouse.move(0, 0);
    await expect(markRadio).toBeChecked();
    await expect.poll(statisticsHighlights).toEqual(highlightCoordinates.map((coordinates) => ({type: 'Point', coordinates, srs: 2056})));

    await featuresTab.click();

    await expect(featuresTab).toHaveAttribute('aria-selected', 'true');
    await expect(statisticsTab).toHaveAttribute('aria-selected', 'false');
    await expect(bottomSheet.locator('feature-info')).toBeVisible();
    await expect.poll(statisticsHighlights).toEqual([]);
    await statisticsTab.click();
    await expect.poll(statisticsHighlights).toEqual(highlightCoordinates.map((coordinates) => ({type: 'Point', coordinates, srs: 2056})));
    expect(statisticsRequests).toBe(3);
    await markHeader.click();
    await expect(markRadio).not.toBeChecked();
    await expect.poll(statisticsHighlights).toEqual([]);
  });
});
