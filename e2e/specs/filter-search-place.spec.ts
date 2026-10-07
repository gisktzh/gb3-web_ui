import {test, expect} from '../fixtures';

test.describe('Test filter search', () => {
  test('searches for an address and delivers data for it in an info request', async ({
    page,
    openUrlWithCoordinates,
    filterForLayer,
    clickMapInTheList,
    search,
    clickDefaultMapViewCenter,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686');

    await filterForLayer('Amtliche Vermessung in Farbe');
    await clickMapInTheList('Amtliche Vermessung in Farbe');

    await search('Stampfenbachstrasse 12');

    const activeMapItem = page.locator('active-map-item').filter({hasText: 'Amtliche Vermessung in Farbe'}).first();
    await expect(activeMapItem.locator('mat-progress-bar')).toHaveCount(0, {timeout: 30_000});

    await clickDefaultMapViewCenter();

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible({timeout: 30_000});
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH527789999186', {
      timeout: 30_000,
    });
  });
});
