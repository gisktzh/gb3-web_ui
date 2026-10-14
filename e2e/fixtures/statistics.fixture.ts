import {test as base, expect} from '../fixtures';
import type {Request, Response} from '@playwright/test';
import type {TopicsListData} from '../../src/app/shared/models/gb3-api-generated.interfaces';
import {statisticsMapQueries} from '../../src/app/shared/configs/statistics.config';
import {setMapScale, waitForMap} from '../utils/map.utils';

type Topic = TopicsListData['categories'][number]['topics'][number];
export interface StatisticsSession {
  topic: Topic;
  availableTopics: Topic[];
  statisticsQueries: URL[];
  featureQueries: URL[];
  statisticsResponses: Response[];
  featureResponses: Response[];
  addMap: (topic: Topic) => Promise<void>;
}

export const test = base.extend<{statisticsSession: StatisticsSession; addStatisticsMapOnStart: boolean}>({
  addStatisticsMapOnStart: [true, {option: true}],
  statisticsSession: async ({page, useHar, openUrlWithCoordinates, login, filterForLayer, addStatisticsMapOnStart}, use, testInfo) => {
    if (process.env['WRITE_HAR'] && (!process.env['TEST_EIAM_USERNAME'] || !process.env['TEST_EIAM_PASSWORD'])) {
      throw new Error('Set TEST_EIAM_USERNAME and TEST_EIAM_PASSWORD to record the authenticated statistics tests.');
    }

    // Each scenario records different queries; separate files prevent later tests from overwriting them.
    await useHar(testInfo.title.replaceAll(/\W+/g, '-').toLowerCase());
    const statisticsQueries: URL[] = [];
    const featureQueries: URL[] = [];
    const statisticsResponses: Response[] = [];
    const featureResponses: Response[] = [];
    const catalogueResponses: Response[] = [];
    const onRequest = (request: Request) => {
      const url = new URL(request.url());
      if (/\/topics\/[^/]+\/statistic_info$/.test(url.pathname)) statisticsQueries.push(url);
      if (/\/topics\/[^/]+\/feature_info$/.test(url.pathname)) featureQueries.push(url);
    };
    const onResponse = (response: Response) => {
      const pathname = new URL(response.url()).pathname;
      if (/\/topics\/[^/]+\/statistic_info$/.test(pathname)) statisticsResponses.push(response);
      if (/\/topics\/[^/]+\/feature_info$/.test(pathname)) featureResponses.push(response);
      if (pathname.endsWith('/gb3/v4/topics') && response.ok()) catalogueResponses.push(response);
    };
    page.on('request', onRequest);
    page.on('response', onResponse);

    try {
      // Authenticate and select the real map before tests switch to a mobile viewport.
      await openUrlWithCoordinates('2681876', '1247142');
      await login();
      await waitForMap(page);
      await expect(page.getByTestId('navbar-user-menu')).toBeVisible();
      const catalogueResponse = catalogueResponses.at(-1);
      if (!catalogueResponse) throw new Error('Login must load the authenticated map catalogue.');
      const catalogue: TopicsListData = await catalogueResponse.json();
      const availableTopics = catalogue.categories
        .flatMap((category) => category.topics)
        .filter((topic) => {
          const queries = statisticsMapQueries[topic.topic];
          return queries?.some((query) => topic.layers.some((layer) => layer.layer === query.layer && layer.initially_visible));
        });
      const queryableTopics = availableTopics.filter((topic) =>
        topic.layers.some(
          (layer) =>
            layer.queryable &&
            layer.initially_visible &&
            (!layer.min_scale || layer.min_scale <= 15_000) &&
            (!layer.max_scale || layer.max_scale >= 15_000),
        ),
      );
      const topic = queryableTopics.find((entry) => entry.topic === 'StatBeschaeftigteZH') ?? queryableTopics[0];
      if (!topic) throw new Error('The test account must have access to a statistics map with feature queries at scale 1:15000.');

      const waitForActiveMap = async (id: string) => {
        const activeMapItem = page.getByTestId('active-map-item-' + id);
        await expect(activeMapItem).toBeVisible({timeout: 30_000});
        await expect(activeMapItem.getByTestId('loading-progress')).toHaveCount(0, {timeout: 30_000});
        if (await page.isVisible('[data-test-id="close-map-notices-button"]')) {
          await page.locator('[data-test-id="close-map-notices-button"]').click();
          await page.waitForTimeout(750);
        }
      };
      const addMap = async (selectedTopic: Topic) => {
        await filterForLayer(selectedTopic.title);
        const addButton = page.getByTestId('catalogue-map-' + selectedTopic.topic).getByTestId('add-active-map');
        await expect(addButton).toBeVisible({timeout: 30_000});
        await expect(addButton).toBeEnabled();
        await addButton.click();
        await waitForActiveMap(selectedTopic.topic);
      };
      if (addStatisticsMapOnStart) await addMap(topic);
      await setMapScale(page, 15_000);

      await use({
        topic,
        availableTopics,
        statisticsQueries,
        featureQueries,
        statisticsResponses,
        featureResponses,
        addMap,
      });
    } finally {
      page.off('request', onRequest);
      page.off('response', onResponse);
    }
  },
});

export {expect};
