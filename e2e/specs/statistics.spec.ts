import {
  test,
  expect,
  resultHost,
  expectedStatisticsPoints,
  readGraphics,
  readInteraction,
  recreateMap,
  setMapScale,
} from '../fixtures/statistics.fixture';
import {InternalDrawingLayer} from '../../src/app/shared/enums/drawing-layer.enum';

test.describe('Statistics', () => {
  for (const viewport of [
    {width: 1440, height: 1000},
    {width: 390, height: 844},
  ]) {
    test(`provides accessible tabs, real feature results and cached statistics at width ${viewport.width}`, async ({
      page,
      statisticsApi,
    }) => {
      await page.setViewportSize(viewport);
      await statisticsApi.openMap();
      const host = resultHost(page);
      const features = host.getByRole('tab', {name: 'Features'});
      const statistics = host.getByRole('tab', {name: 'Statistik'});
      await expect(host.locator('feature-info')).toContainText('Feature for StatBeschaeftigteZH');
      expect(statisticsApi.statisticsQueries).toHaveLength(0);
      await features.focus();
      await features.press('ArrowRight');
      await expect(statistics).toBeFocused();
      await statistics.press('Home');
      await expect(features).toBeFocused();
      await features.press('End');
      await expect(statistics).toBeFocused();
      await statistics.press('Space');
      await expect(statistics).toHaveAttribute('aria-selected', 'true');
      await expect(features).toHaveAttribute('tabindex', '-1');
      await expect(host.locator('statistics')).toContainText('Anzahl Beschäftigte');
      await expect(host.locator('statistics-item')).toContainText('42');
      const panel = host.getByRole('tabpanel');
      await expect(panel).toHaveAttribute('aria-labelledby', (await statistics.getAttribute('id'))!);
      await expect(statistics).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
      await features.click();
      await expect(host.locator('feature-info')).toContainText('Feature for StatBeschaeftigteZH');
      await statistics.click();
      await expect(host.locator('statistics-item')).toContainText('42');
      expect(statisticsApi.statisticsQueries).toHaveLength(1);
      expect(statisticsApi.featureQueries).toHaveLength(1);
    });
  }

  test('previews, pins and unpins deduplicated geometries through shared mouse and keyboard interactions', async ({
    page,
    statisticsApi,
  }) => {
    await statisticsApi.openMap();
    const host = resultHost(page);
    await host.getByRole('tab', {name: 'Statistik'}).click();
    await expect(host.locator('statistics-item')).toContainText('42');
    const expected = expectedStatisticsPoints(statisticsApi.statisticsQueries[0]).map((coordinates) => ({
      type: 'Point',
      coordinates,
      srs: 2056,
    }));
    const highlights = () => readGraphics(page, InternalDrawingLayer.StatisticsHighlight);
    await expect.poll(highlights).toEqual([]);
    const header = host.locator('statistics-item th:has(input[type="radio"])');
    const radio = host.locator('statistics-item input[type="radio"]');
    await header.hover();
    await expect.poll(highlights).toEqual(expected);
    await expect(radio).toBeChecked();
    await page.mouse.move(0, 0);
    await expect.poll(highlights).toEqual([]);
    await host.locator('statistics-item td').first().hover();
    await expect.poll(highlights).toEqual(expected);
    await host.getByRole('tab', {name: 'Features'}).click();
    await host.getByRole('tab', {name: 'Statistik'}).click();
    await expect.poll(highlights).toEqual([]);
    await header.hover();
    await radio.press('Space');
    await page.mouse.move(0, 0);
    await expect.poll(highlights).toEqual(expected);
    await host.getByRole('tab', {name: 'Features'}).click();
    await expect.poll(highlights).toEqual([]);
    await host.getByRole('tab', {name: 'Statistik'}).click();
    await expect.poll(highlights).toEqual(expected);
    await header.click();
    await expect.poll(highlights).toEqual([]);
    await expect(radio).not.toBeChecked();
  });

  test('keeps statistics available outside rendering scales and validates radius changes without stale markings', async ({
    page,
    statisticsApi,
  }) => {
    await statisticsApi.openMap();
    const host = resultHost(page);
    await host.getByRole('tab', {name: 'Statistik'}).click();
    await expect(host.locator('statistics-item')).toContainText('42');
    await host.locator('statistics-item th:has(input[type="radio"])').click();
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await readGraphics(page, InternalDrawingLayer.StatisticsHighlight)).length).toBe(2);
    await setMapScale(page, 1_100_000);
    const radius = host.locator('#statistics-radius-input');
    await radius.fill('1000');
    await radius.blur();
    await expect.poll(() => statisticsApi.statisticsQueries.length).toBe(2);
    await expect(host.locator('statistics-item')).toContainText('42');
    await expect.poll(() => readGraphics(page, InternalDrawingLayer.StatisticsHighlight)).toEqual([]);
    expect(statisticsApi.featureQueries).toHaveLength(1);
    await radius.fill('4000');
    await radius.blur();
    await expect(radius).toHaveAttribute('aria-invalid', 'true');
    await expect(host.locator('#statistics-radius-error')).toBeVisible();
    expect(statisticsApi.statisticsQueries).toHaveLength(2);
    await radius.fill('500');
    await radius.blur();
    await expect.poll(() => statisticsApi.statisticsQueries.length).toBe(3);
    await expect(host.locator('#statistics-radius-error')).toHaveCount(0);
  });

  test('releases measurement when activating either query mode, including reselecting Features', async ({page, statisticsApi}) => {
    await statisticsApi.openMap();
    const tools = page.locator('map-tools-desktop');
    await tools.getByRole('button', {name: 'Messen', exact: true}).click();
    await page.locator('measurement-tools button').nth(1).click();
    await expect.poll(() => readInteraction(page)).toEqual({mode: 'feature', activeTool: 'measure-line'});
    await resultHost(page).getByRole('tab', {name: 'Features'}).click();
    await expect.poll(() => readInteraction(page)).toEqual({mode: 'feature', activeTool: undefined});
    await tools.getByRole('button', {name: 'Messen', exact: true}).click();
    await page.locator('measurement-tools button').nth(1).click();
    await tools.getByRole('button', {name: 'Statistik-Abfrage', exact: true}).click();
    await expect.poll(() => readInteraction(page)).toEqual({mode: 'statistics', activeTool: undefined});
    await expect(resultHost(page).locator('statistics-item')).toContainText('42');
  });

  test('restores areas and pins after map recreation without leaking feature markings into statistics', async ({page, statisticsApi}) => {
    await statisticsApi.openMap();
    const host = resultHost(page);
    await host.locator('feature-info-content th:has(input[type="radio"])').click();
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await readGraphics(page, InternalDrawingLayer.FeatureHighlight)).length).toBe(1);
    await host.getByRole('tab', {name: 'Statistik'}).click();
    await expect(host.locator('statistics-item')).toContainText('42');
    await expect.poll(() => readGraphics(page, InternalDrawingLayer.FeatureHighlight)).toEqual([]);
    await expect(host.getByRole('button', {name: 'Info drucken', exact: true})).toHaveCount(0);
    await host.locator('statistics-item th:has(input[type="radio"])').click();
    await page.mouse.move(0, 0);
    await recreateMap(page);
    await expect.poll(async () => (await readGraphics(page, InternalDrawingLayer.StatisticsArea)).length).toBe(1);
    await expect.poll(async () => (await readGraphics(page, InternalDrawingLayer.StatisticsHighlight)).length).toBe(2);
    await expect.poll(() => readGraphics(page, InternalDrawingLayer.FeatureHighlight)).toEqual([]);
    await host.getByRole('tab', {name: 'Features'}).click();
    await expect(host.locator('feature-info')).toContainText('Feature for StatBeschaeftigteZH');
    await expect.poll(async () => (await readGraphics(page, InternalDrawingLayer.FeatureHighlight)).length).toBe(1);
    await expect.poll(() => readGraphics(page, InternalDrawingLayer.StatisticsArea)).toEqual([]);
    await expect(host.getByRole('button', {name: 'Info drucken', exact: true})).toBeEnabled();
    expect(statisticsApi.statisticsQueries).toHaveLength(1);
  });

  test('refreshes actual feature content after adding another map while statistics are active', async ({page, statisticsApi}) => {
    await statisticsApi.openMap();
    const host = resultHost(page);
    await host.getByRole('tab', {name: 'Statistik'}).click();
    await expect(host.locator('statistics-item')).toContainText('42');
    await page.getByRole('button', {name: 'Test maps', exact: true}).click();
    await page
      .locator('map-data-item-map')
      .filter({hasText: 'Bevölkerungsstatistik'})
      .getByRole('button', {name: 'Karte hinzufügen', exact: true})
      .click();
    await expect(host.locator('statistics-item')).toHaveCount(2);
    await host.getByRole('tab', {name: 'Features'}).click();
    await expect(host.locator('feature-info')).toContainText('Feature for StatBeschaeftigteZH');
    await expect(host.locator('feature-info')).toContainText('Feature for StatBevoelkerungZH');
    expect(statisticsApi.featureQueries).toHaveLength(3);
  });

  test('owns icon layout in ÖREB-only and statistics headers without feature content styles', async ({page, statisticsApi}) => {
    statisticsApi.emptyFeatures = true;
    await statisticsApi.openMap(['KatOerebRaumplanungZH']);
    const host = resultHost(page);
    await expect(host.locator('feature-info-content')).toHaveCount(0);
    await expect(host.locator('oereb-extract')).toContainText('CH000000000001');
    const readSpacing = (icons: Element[]) =>
      icons.map((icon) => {
        const title = icon.closest('mat-expansion-panel-header')?.querySelector('.list-item__header__content__title');
        if (!title) throw new Error('A header icon must have a title.');
        return {width: icon.getBoundingClientRect().width, gap: title.getBoundingClientRect().left - icon.getBoundingClientRect().right};
      });
    expect(await host.locator('oereb-extract .feature-info-item-icon').evaluateAll(readSpacing)).toEqual([
      {width: 24, gap: 12},
      {width: 24, gap: 12},
      {width: 24, gap: 12},
    ]);
    await statisticsApi.openMap();
    await expect(host.locator('feature-info-content')).toHaveCount(0);
    await host.getByRole('tab', {name: 'Statistik'}).click();
    await expect(host.locator('statistics-item')).toContainText('42');
    expect(await host.locator('statistics-item .statistics-item__icon').evaluateAll(readSpacing)).toEqual([
      {width: 24, gap: 12},
      {width: 24, gap: 12},
    ]);
  });
});
