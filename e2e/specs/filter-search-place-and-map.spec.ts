import {test, expect} from '../fixtures';

test.describe('Test filter search for maps and places', () => {
  test('searches for an address and delivers data for it in an info request', async ({
    page,
    openUrlWithCoordinates,
    search,
    zoom,
    clickDefaultMapViewCenter,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686');

    await search('Gemeinde Dübendorf');
    const zoomInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Massstab anpassen"]');
    await expect(zoomInput).toBeVisible();
    await expect(zoomInput).toHaveValue('23467');

    await search('Amtliche Vermessung in Farbe');
    const activeMapItem = page.locator('active-map-item').filter({hasText: 'Amtliche Vermessung in Farbe'}).first();
    await expect(activeMapItem).toBeVisible({timeout: 30_000});

    await zoom(3000);
    await expect(activeMapItem.locator('mat-progress-bar')).toHaveCount(0, {timeout: 30_000});

    await clickDefaultMapViewCenter();

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible({timeout: 30_000});
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH107703719475', {
      timeout: 30_000,
    });
  });
});
