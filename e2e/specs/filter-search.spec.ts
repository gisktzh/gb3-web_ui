import {test, expect} from '../fixtures';

test.describe('Test filter search', () => {
  test('searches for an address and delivers data for it in an info request', async ({
    page,
    openUrlWithCoordinates,
    filterForLayer,
    clickMapInTheList,
    search,
    useHar,
  }) => {
    await useHar();

    await openUrlWithCoordinates('2702555', '1241686');

    await filterForLayer('Amtliche Vermessung in Farbe');
    await clickMapInTheList('Amtliche Vermessung in Farbe');

    await search('Stampfenbachstrasse 12');

    const map = page.locator('map-page');
    await expect(map).toBeVisible();

    await map.click();

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH527789999186');
  });
});
