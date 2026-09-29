import {test, expect, describeA11y} from '../fixtures';

test.describe('Test filter search', () => {
  test('searches for an address and delivers data for it in an info request', async ({
    page,
    openMapWithActiveLayer,
    search,
    useHar,
    captureConsole,
    clickDefaultMapViewCenter
  }) => {
    await useHar();
    captureConsole();

    await openMapWithActiveLayer('2702555', '1241686', 'Amtliche Vermessung in Farbe');

    await search('Stampfenbachstrasse 12');

    const activeMapItem = page.locator('active-map-item').filter({hasText: 'Amtliche Vermessung in Farbe'}).first();
    await expect(activeMapItem.locator('mat-progress-bar')).toHaveCount(0, {timeout: 30_000});

    await clickDefaultMapViewCenter();

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible({timeout: 30_000});
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH527789999186', {
      timeout: 30_000,
    });
  });

  describeA11y(() => {
    test('has no detectable accessibility violations while showing search results', async ({
      openMapWithActiveLayer,
      searchAndShowResults,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      await openMapWithActiveLayer('2702555', '1241686', 'Amtliche Vermessung in Farbe');

      await searchAndShowResults('Stampfenbachstrasse 12');

      await checkA11y();
    });
  });
});
