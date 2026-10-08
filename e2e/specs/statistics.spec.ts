import {test, expect} from '../fixtures/statistics.fixture';
import {clickMapPoint, getMapPoint, mapScreenshot, waitForMap, type MapPoint} from '../utils/map.utils';
import {
  resultHost,
  expectFeatureResponse,
  expectStatisticsResult,
  expectStatisticsCircle,
  expectStatisticsPolygon,
} from '../utils/query-results.utils';

test.describe('Statistics', () => {
  test.describe.configure({timeout: 120_000});

  test.describe('Availability', () => {
    test.use({addStatisticsMapOnStart: false});

    test('reveals statistics for supported maps and hides them after the last one is removed', async ({page, statisticsSession}) => {
      const host = resultHost(page);
      const statisticsButton = page.getByTestId('map-select-statistic');
      const statisticsTab = host.getByTestId('query-tab-statistics');
      const featuresTab = host.getByTestId('query-tab-feature');
      await expect(statisticsButton).toBeVisible();
      await expect(statisticsButton).toBeDisabled();

      const point = await getMapPoint(page);
      await clickMapPoint(page, point);
      await expect(host.getByTestId('query-feature-results')).toBeVisible();
      await expect(featuresTab).toHaveCount(0);
      await expect(statisticsTab).toHaveCount(0);
      await waitForMap(page);
      expect(statisticsSession.statisticsQueries).toHaveLength(0);

      await statisticsSession.addMap(statisticsSession.topic);
      await expect(statisticsButton).toBeEnabled();
      await expect(featuresTab).toHaveAttribute('aria-selected', 'true');
      await expect(statisticsTab).toBeVisible();
      await expect(host.getByTestId('statistics-radius')).toHaveCount(0);
      await expectFeatureResponse(page, statisticsSession, point.coordinates);
      await waitForMap(page);
      expect(statisticsSession.statisticsQueries).toHaveLength(0);

      await statisticsTab.click();
      await expectStatisticsResult(page, statisticsSession);
      await expect(statisticsTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('statistics-tools')).toBeVisible();

      const queryCount = statisticsSession.statisticsQueries.length;
      const lastMap = page.getByTestId('active-map-item-' + statisticsSession.topic.topic);
      await lastMap.getByTestId('active-map-item-header').hover();
      await lastMap.getByTestId('delete').click();
      await expect(lastMap).toHaveCount(0);
      await expect(statisticsButton).toBeDisabled();
      await expect(featuresTab).toHaveCount(0);
      await expect(statisticsTab).toHaveCount(0);
      await expect(page.getByTestId('statistics-tools')).toHaveCount(0);
      await expect(page.getByTestId('map-select-feature')).toHaveClass(/map-tools-desktop__list__button--active/);
      await expect(host.getByTestId('query-feature-results')).toBeVisible();
      await waitForMap(page);
      expect(statisticsSession.statisticsQueries).toHaveLength(queryCount);

      await statisticsSession.addMap(statisticsSession.topic);
      await expect(statisticsButton).toBeEnabled();
      await expect(statisticsTab).toBeVisible();
      await expect(featuresTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('statistics-tools')).toHaveCount(0);
      await waitForMap(page);
      expect(statisticsSession.statisticsQueries).toHaveLength(queryCount);
    });
  });

  test('queries a selected point and updates the area when radius and location change', async ({page, statisticsSession}) => {
    // Selecting statistics must release another tool and work without a previous feature query.
    await page.getByTestId('map-ruler').click();
    await page.getByTestId('measurement-select-line').click();
    await page.getByTestId('map-select-statistic').click();
    await expect(page.getByTestId('statistics-tools')).toBeVisible();
    expect(statisticsSession.statisticsQueries).toHaveLength(0);
    expect(statisticsSession.featureQueries).toHaveLength(0);
    const firstPoint = await getMapPoint(page);
    await clickMapPoint(page, firstPoint);
    await expectStatisticsResult(page, statisticsSession);
    expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, firstPoint.coordinates, 500);

    const host = resultHost(page);
    const radius = host.getByTestId('statistics-radius');
    const responseIndex = statisticsSession.statisticsResponses.length;
    const queryCount = statisticsSession.statisticsQueries.length;
    await radius.fill('1000');
    await radius.blur();
    await expectStatisticsResult(page, statisticsSession, responseIndex);
    await expect(radius).toHaveValue('1000');
    expect(statisticsSession.statisticsQueries).toHaveLength(queryCount + 1);
    expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, firstPoint.coordinates, 1000);

    await waitForMap(page);
    const nextPoint = await getMapPoint(page, {x: 80, y: -40});
    expect(
      Math.hypot(nextPoint.coordinates[0] - firstPoint.coordinates[0], nextPoint.coordinates[1] - firstPoint.coordinates[1]),
    ).toBeGreaterThan(100);
    const nextResponseIndex = statisticsSession.statisticsResponses.length;
    const featureResponseIndex = statisticsSession.featureResponses.length;
    await clickMapPoint(page, nextPoint);
    await expectStatisticsResult(page, statisticsSession, nextResponseIndex);
    expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, nextPoint.coordinates, 1000);
    await host.getByTestId('query-tab-feature').click();
    await expectFeatureResponse(page, statisticsSession, nextPoint.coordinates, featureResponseIndex);
  });

  test('draws a polygon and switches to a circle drawn through the statistics controls', async ({page, statisticsSession}) => {
    await page.getByTestId('map-select-statistic').click();
    // Dismiss the toolbar tooltip before it can cover the polygon control.
    await page.mouse.move(0, 0);
    const polygonTool = page.getByTestId('statistics-select-polygon');
    await polygonTool.click();
    await expect(polygonTool).toHaveClass(/statistics-tools__button--active/);
    await waitForMap(page);
    const vertices: MapPoint[] = [];
    for (const offset of [
      {x: -90, y: -70},
      {x: 90, y: -70},
      {x: 0, y: 100},
    ]) {
      vertices.push(await getMapPoint(page, offset));
    }
    for (const vertex of vertices) await clickMapPoint(page, vertex);
    // Close the polygon by clicking its start vertex, as the tool's instructions describe.
    await clickMapPoint(page, vertices[0]);
    await expectStatisticsResult(page, statisticsSession);
    expectStatisticsPolygon(
      statisticsSession.statisticsQueries.at(-1)!,
      vertices.map((vertex) => vertex.coordinates),
    );

    const host = resultHost(page);
    const mode = host.getByTestId('statistics-mode');
    await expect(mode).toContainText('Polygon');
    await waitForMap(page);
    const movedPoint = await getMapPoint(page, {x: 60, y: 40});
    const xs = vertices.map((vertex) => vertex.coordinates[0]);
    const ys = vertices.map((vertex) => vertex.coordinates[1]);
    const deltaX = movedPoint.coordinates[0] - (Math.min(...xs) + Math.max(...xs)) / 2;
    const deltaY = movedPoint.coordinates[1] - (Math.min(...ys) + Math.max(...ys)) / 2;
    const movedResponseIndex = statisticsSession.statisticsResponses.length;
    await clickMapPoint(page, movedPoint);
    await expectStatisticsResult(page, statisticsSession, movedResponseIndex);
    expectStatisticsPolygon(
      statisticsSession.statisticsQueries.at(-1)!,
      vertices.map(({coordinates: [x, y]}) => [x + deltaX, y + deltaY]),
    );
    const responseIndex = statisticsSession.statisticsResponses.length;
    await mode.click();
    await page.getByTestId('statistics-mode-circle').click();
    await expect(host.getByTestId(/^statistics-result-/)).toHaveCount(0);
    await expect(host.getByTestId('statistics-selection-prompt')).toContainText('Wählen Sie ein Gebiet auf der Karte');
    const circleTool = page.getByTestId('statistics-select-circle');
    await expect(circleTool).toHaveClass(/statistics-tools__button--active/);
    await waitForMap(page);
    const center = await getMapPoint(page);
    const edge = await getMapPoint(page, {x: 110, y: 0});
    await clickMapPoint(page, center);
    await clickMapPoint(page, edge);
    await expectStatisticsResult(page, statisticsSession, responseIndex);
    const drawnRadius = Math.hypot(edge.coordinates[0] - center.coordinates[0], edge.coordinates[1] - center.coordinates[1]);
    expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, center.coordinates, drawnRadius);
    await expect(host.getByTestId('statistics-radius')).toHaveValue(Math.round(drawnRadius).toString());
    await expect(mode).toContainText('Umkreis');
    await expect(circleTool).not.toHaveClass(/statistics-tools__button--active/);
  });

  test('previews and pins markings and preserves cached results across accessible tab switches', async ({page, statisticsSession}) => {
    await page.getByTestId('map-select-statistic').click();
    const point = await getMapPoint(page);
    await clickMapPoint(page, point);
    const result = await expectStatisticsResult(page, statisticsSession);
    expect(result.feature_geometry, 'The recorded area must include geometries that can be marked.').not.toBeNull();
    const host = resultHost(page);
    const item = host.getByTestId('statistics-result-' + result.topic);
    const header = item.getByTestId('statistics-layer-' + result.layer).getByTestId('statistics-marking-header');
    // Material owns the native input inside the application control's test ID.
    const radio = header.getByTestId('statistics-marking').locator('input');
    await expect(radio).toBeEnabled();
    await page.mouse.move(0, 0);
    await waitForMap(page);
    const unmarkedMap = await mapScreenshot(page);
    await header.hover();
    await expect(radio).toBeChecked();
    await expect.poll(async () => (await mapScreenshot(page)).equals(unmarkedMap)).toBe(false);
    await page.mouse.move(0, 0);
    await expect(radio).not.toBeChecked();
    await expect.poll(async () => (await mapScreenshot(page)).equals(unmarkedMap)).toBe(true);

    await radio.focus();
    await radio.press('Space');
    await expect(radio).toBeChecked();
    await expect.poll(async () => (await mapScreenshot(page)).equals(unmarkedMap)).toBe(false);
    const statisticsContent = await item.innerText();
    const queryCount = statisticsSession.statisticsQueries.length;
    const features = host.getByTestId('query-tab-feature');
    const statistics = host.getByTestId('query-tab-statistics');
    await statistics.focus();
    await statistics.press('Home');
    await expect(features).toBeFocused();
    await features.press('Space');
    await expect(features).toHaveAttribute('aria-selected', 'true');
    await expectFeatureResponse(page, statisticsSession, point.coordinates);
    await waitForMap(page);
    const featureQueryCount = statisticsSession.featureQueries.length;
    const featureContent = await host.getByTestId('query-feature-results').innerText();
    await features.press('End');
    await expect(statistics).toBeFocused();
    await statistics.press('Space');
    await expect(statistics).toHaveAttribute('aria-selected', 'true');
    await expect(item).toHaveText(statisticsContent, {useInnerText: true});
    await expect(radio).toBeChecked();
    await features.click();
    await expect(host.getByTestId('query-feature-results')).toHaveText(featureContent, {useInnerText: true});
    await statistics.click();
    await header.click();
    await page.mouse.move(0, 0);
    await expect(radio).not.toBeChecked();
    await expect.poll(async () => (await mapScreenshot(page)).equals(unmarkedMap)).toBe(true);
    await waitForMap(page);
    expect(statisticsSession.statisticsQueries).toHaveLength(queryCount);
    expect(statisticsSession.featureQueries).toHaveLength(featureQueryCount);
  });

  test('updates contributing maps and layers when adding, hiding and removing them', async ({page, statisticsSession}) => {
    const additionalTopic = statisticsSession.availableTopics.find((topic) => topic.topic !== statisticsSession.topic.topic);
    expect(additionalTopic, 'The statistics test account must have access to two supported maps.').toBeDefined();
    await page.getByTestId('map-select-statistic').click();
    await clickMapPoint(page, await getMapPoint(page));
    const primaryResult = await expectStatisticsResult(page, statisticsSession);
    const host = resultHost(page);
    const primaryItem = page.getByTestId('active-map-item-' + statisticsSession.topic.topic);
    await primaryItem.getByTestId('show-layers-of-the-map').click();
    const configuredLayer = statisticsSession.topic.layers.find((layer) => layer.layer === primaryResult.layer);
    expect(configuredLayer, 'The statistics result must belong to a layer in the selected map.').toBeDefined();
    const layer = primaryItem.getByTestId('active-map-layer-' + configuredLayer!.layer);
    await expect(layer).toHaveCount(1);
    const layerVisibility = layer.getByTestId('active-layer-visibility').locator('input');
    await layerVisibility.uncheck();
    await expect(host.getByTestId(/^statistics-result-/)).toHaveCount(0);
    await expect(host.getByTestId('statistics-empty')).toHaveText('Keine Statistik-Daten für das gewählte Gebiet!');
    await waitForMap(page);
    const responseIndex = statisticsSession.statisticsResponses.length;
    await layerVisibility.check();
    await expectStatisticsResult(page, statisticsSession, responseIndex);

    const addedResponseIndex = statisticsSession.statisticsResponses.length;
    await statisticsSession.addMap(additionalTopic!);
    await expectStatisticsResult(page, statisticsSession, addedResponseIndex);
    await expectStatisticsResult(page, statisticsSession, addedResponseIndex, additionalTopic!.topic);
    await expect(host.getByTestId(/^statistics-result-/)).toHaveCount(2);
    const addedItem = page.getByTestId('active-map-item-' + additionalTopic!.topic);
    const mapVisibility = addedItem.getByTestId('active-map-visibility').locator('input');
    const hiddenResponseIndex = statisticsSession.statisticsResponses.length;
    const hiddenQueryIndex = statisticsSession.statisticsQueries.length;
    await mapVisibility.uncheck();
    await expectStatisticsResult(page, statisticsSession, hiddenResponseIndex);
    await expect(host.getByTestId(/^statistics-result-/)).toHaveCount(1);
    await waitForMap(page);
    expect(
      statisticsSession.statisticsQueries
        .slice(hiddenQueryIndex)
        .every((query) => query.pathname.endsWith('/topics/' + statisticsSession.topic.topic + '/statistic_info')),
    ).toBe(true);
    const restoredResponseIndex = statisticsSession.statisticsResponses.length;
    await mapVisibility.check();
    await expectStatisticsResult(page, statisticsSession, restoredResponseIndex, additionalTopic!.topic);
    await expect(host.getByTestId(/^statistics-result-/)).toHaveCount(2);
    const removedResponseIndex = statisticsSession.statisticsResponses.length;
    await addedItem.getByTestId('active-map-item-header').hover();
    await addedItem.getByTestId('delete').click();
    await expect(addedItem).toHaveCount(0);
    await expectStatisticsResult(page, statisticsSession, removedResponseIndex);
    await expect(host.getByTestId(/^statistics-result-/)).toHaveCount(1);
  });

  test('rejects an invalid radius and recovers with a valid selection', async ({page, statisticsSession}) => {
    await page.getByTestId('map-select-statistic').click();
    const point = await getMapPoint(page);
    await clickMapPoint(page, point);
    await expectStatisticsResult(page, statisticsSession);
    await waitForMap(page);
    const host = resultHost(page);
    const radius = host.getByTestId('statistics-radius');
    const queryCount = statisticsSession.statisticsQueries.length;
    const responseIndex = statisticsSession.statisticsResponses.length;
    await radius.fill('4000');
    await radius.blur();
    await expect(radius).toHaveAttribute('aria-invalid', 'true');
    await expect(host.getByTestId('statistics-radius-error')).toBeVisible();
    await expect(radius).toHaveAttribute('aria-describedby', 'statistics-radius-error');
    await waitForMap(page);
    expect(statisticsSession.statisticsQueries).toHaveLength(queryCount);
    await radius.fill('750');
    await radius.blur();
    await expectStatisticsResult(page, statisticsSession, responseIndex);
    await expect(host.getByTestId('statistics-radius-error')).toHaveCount(0);
    await expect(radius).not.toHaveAttribute('aria-invalid', 'true');
    expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, point.coordinates, 750);
  });

  test.describe('Mobile', () => {
    test.use({hasTouch: true});

    test('selects locations by touch and changes radius in the bottom sheet', async ({page, statisticsSession}) => {
      await page.setViewportSize({width: 390, height: 844});
      await waitForMap(page);
      const point = await getMapPoint(page);
      await page.touchscreen.tap(point.position.x, point.position.y);
      const host = resultHost(page);
      await expect(host.getByTestId('bottom-sheet-title')).toBeVisible();
      await expect(host.getByTestId('bottom-sheet-title')).toHaveText('Info');
      await expectFeatureResponse(page, statisticsSession, point.coordinates);
      expect(statisticsSession.statisticsQueries).toHaveLength(0);
      await host.getByTestId('query-tab-statistics').tap();
      await expectStatisticsResult(page, statisticsSession);
      expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, point.coordinates, 500);
      const radius = host.getByTestId('statistics-radius');
      const responseIndex = statisticsSession.statisticsResponses.length;
      await radius.fill('1000');
      await radius.blur();
      await expectStatisticsResult(page, statisticsSession, responseIndex);
      expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, point.coordinates, 1000);

      const item = host.getByTestId('statistics-result-' + statisticsSession.topic.topic);
      const statisticsContent = await item.innerText();
      const queryCount = statisticsSession.statisticsQueries.length;
      await host.getByTestId('query-tab-feature').tap();
      await host.getByTestId('query-tab-statistics').tap();
      await expect(item).toHaveText(statisticsContent, {useInnerText: true});
      expect(statisticsSession.statisticsQueries).toHaveLength(queryCount);
      await host.getByTestId('bottom-sheet-close').tap();
      await expect(host.getByTestId('query-tab-statistics')).toHaveCount(0);
      await waitForMap(page);
      const nextPoint = await getMapPoint(page, {x: 55, y: -35});
      const nextResponseIndex = statisticsSession.statisticsResponses.length;
      await page.touchscreen.tap(nextPoint.position.x, nextPoint.position.y);
      await expectStatisticsResult(page, statisticsSession, nextResponseIndex);
      expectStatisticsCircle(statisticsSession.statisticsQueries.at(-1)!, nextPoint.coordinates, 1000);
      await expect(host.getByTestId('statistics-radius')).toHaveValue('1000');

      // Removing the last supported map must return the mobile query to features.
      const finalQueryCount = statisticsSession.statisticsQueries.length;
      await host.getByTestId('bottom-sheet-close').tap();
      await page.getByTestId('map-management-open').tap();
      const management = page.getByTestId('map-management-mobile');
      await expect(management).toBeVisible();
      await management.getByTestId('map-management-tab-active').tap();
      const lastMap = management.getByTestId('active-map-item-' + statisticsSession.topic.topic);
      await lastMap.getByTestId('delete').tap();
      await expect(lastMap).toHaveCount(0);
      await expect(host.getByTestId('query-feature-results')).toBeVisible();
      await expect(host.getByTestId('query-tab-feature')).toHaveCount(0);
      await expect(host.getByTestId('query-tab-statistics')).toHaveCount(0);
      await expect(host.getByTestId('statistics-radius')).toHaveCount(0);
      await expect(page.getByTestId('statistics-tools')).toHaveCount(0);
      await waitForMap(page);
      expect(statisticsSession.statisticsQueries).toHaveLength(finalQueryCount);
    });
  });
});
