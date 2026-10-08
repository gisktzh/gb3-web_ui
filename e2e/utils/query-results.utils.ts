import {expect, type Page, type Response} from '@playwright/test';
import type {Feature, StatisticInfo} from '../../src/app/shared/models/gb3-api-generated.interfaces';
import type {MapCoordinates} from './map.utils';

export function resultHost(page: Page) {
  return page.getByTestId((page.viewportSize()?.width ?? 1920) < 768 ? 'query-results-mobile' : 'query-results-desktop');
}

export async function expectFeatureResult(page: Page, result: Feature) {
  const layers = result.feature_info.results.layers.filter((layer) => layer.features.length > 0);
  if (layers.length === 0) {
    await expect(resultHost(page).getByTestId('query-feature-results')).toContainText('Keine kartenspezifischen Treffer!');
  } else {
    await Promise.all(
      layers.map(async (layer) => {
        const table = resultHost(page)
          .getByTestId('feature-result-' + result.feature_info.results.topic + '-' + layer.layer)
          .getByTestId('info-table');
        await expect(table).toBeVisible();
        await expect(table).toHaveAccessibleName(`Informationen zu ${layer.title}`);
      }),
    );
  }
}

export async function expectStatisticsResult(
  page: Page,
  session: {topic: {topic: string}; statisticsResponses: Response[]},
  responseIndex = 0,
  topic = session.topic.topic,
): Promise<StatisticInfo> {
  const matchingResponse = () =>
    session.statisticsResponses
      .slice(responseIndex)
      .find((response) => new URL(response.url()).pathname.endsWith(`/topics/${topic}/statistic_info`));
  await expect.poll(() => !!matchingResponse()).toBe(true);
  const response = matchingResponse()!;
  expect(response.ok(), `Statistics query failed with HTTP ${response.status()}`).toBe(true);
  const {statistic_info: result}: {statistic_info: StatisticInfo} = await response.json();
  expect(result.topic).toBe(topic);
  const item = resultHost(page).getByTestId('statistics-result-' + result.topic);
  await expect(item).toBeVisible();
  expect(
    result.fields.some((field) => result.results[field].count > 0),
    'The selected area must contain statistics data.',
  ).toBe(true);
  const table = item.getByTestId('statistics-layer-' + result.layer).getByTestId('info-table');
  await expect(table).toBeVisible();
  await expect(table).toHaveAccessibleName(`Statistik zu ${result.layer_title}`);
  const rows = table.getByTestId('info-table-row');
  await expect(rows).toHaveCount(result.fields.length);
  const formatter = new Intl.NumberFormat('de-CH', {maximumFractionDigits: 2});
  await Promise.all(
    result.fields.map(async (field, index) => {
      await expect
        .poll(async () => (await rows.nth(index).getByTestId('info-table-row-label').innerText()).replaceAll('\u00ad', '').trim())
        .toBe(result.results[field].alias);
      const value = result.results[field].value;
      const expected = value === null ? '–' : formatter.format(Number(value)).replaceAll(/['’\s]/g, '');
      await expect
        .poll(async () => (await rows.nth(index).getByTestId('info-table-value').innerText()).replaceAll(/['’\s]/g, ''))
        .toBe(expected);
    }),
  );
  return result;
}

export async function expectFeatureResponse(
  page: Page,
  session: {topic: {topic: string}; featureResponses: Response[]},
  point: MapCoordinates,
  responseIndex = 0,
): Promise<Feature> {
  const matchingResponse = () =>
    session.featureResponses
      .slice(responseIndex)
      .find((response) => new URL(response.url()).pathname.endsWith(`/topics/${session.topic.topic}/feature_info`));
  await expect.poll(() => !!matchingResponse()).toBe(true);
  const response = matchingResponse()!;
  expect(response.ok(), `Feature query failed with HTTP ${response.status()}`).toBe(true);
  expectQueryPoint(new URL(response.url()), point);
  const result: Feature = await response.json();
  await expectFeatureResult(page, result);
  return result;
}

export function expectQueryPoint(query: URL, point: MapCoordinates) {
  for (const [index, axis] of ['x', 'y'].entries()) {
    const value = query.searchParams.get(axis);
    expect(value, `The feature query must include ${axis}.`).not.toBeNull();
    expect(Math.abs(Number(value) - point[index])).toBeLessThan(1);
  }
}

function statisticsRing(query: URL): MapCoordinates[] {
  expect(query.searchParams.get('srid')).toBe('2056');
  expect(query.searchParams.get('statistic')).toBe('sum');
  const match = query.searchParams.get('geometry')?.match(/^POLYGON\(\(([^()]+)\)\)$/);
  expect(match, 'Statistics must query a closed polygon.').toBeTruthy();
  const ring = match![1].split(',').map((position): MapCoordinates => {
    const coordinates = position.trim().split(/\s+/).map(Number);
    expect(coordinates).toHaveLength(2);
    expect(coordinates.every(Number.isFinite)).toBe(true);
    return [coordinates[0], coordinates[1]];
  });
  expect(ring.length).toBeGreaterThanOrEqual(4);
  expect(ring.at(-1)).toEqual(ring[0]);
  return ring;
}

export function expectStatisticsCircle(query: URL, center: MapCoordinates, radius: number) {
  const ring = statisticsRing(query);
  expect(ring.length).toBeGreaterThan(8);
  for (const [x, y] of ring) {
    expect(Math.abs(Math.hypot(x - center[0], y - center[1]) - radius)).toBeLessThan(1);
  }
}

export function expectStatisticsPolygon(query: URL, vertices: MapCoordinates[]) {
  const ring = statisticsRing(query).slice(0, -1);
  expect(ring).toHaveLength(vertices.length);
  // ArcGIS may reverse ring orientation; the selected vertices must still be the ones sent to the API.
  for (const [x, y] of vertices) {
    expect(ring.some(([actualX, actualY]) => Math.hypot(actualX - x, actualY - y) < 1)).toBe(true);
  }
}
