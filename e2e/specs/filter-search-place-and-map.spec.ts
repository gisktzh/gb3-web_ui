import {test, expect} from '../fixtures';

test.describe('Test filter search for maps and places', () => {
  test('searches for an address and delivers data for it in an info request', async ({
    page,
    openUrlWithCoordinates,
    search,
    zoom,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686');

    await search('Gemeinde Dübendorf');
    const zoomInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Massstab anpassen"]');
    await expect(zoomInput).toBeVisible();
    await expect(zoomInput).toHaveValue('19369');

    await search('Amtliche Vermessung in Farbe');

    await zoom(3000);

    const map = page.locator('map-page');
    await expect(map).toBeVisible();

    await map.click({force: true});
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH107703719475');
  });
});
