import {test, expect} from '../fixtures';

test.describe('Map operation', () => {
  test('operates the map', async ({page, useHar, openUrlWithCoordinates, captureConsole}) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686');

    const desktopToolDividers = page.locator('map-tools-desktop .map-tools-desktop__list').first().locator('mat-divider');
    await expect(desktopToolDividers.first()).toBeVisible();
    await expect(desktopToolDividers.first()).toHaveCSS('width', '30px');

    const mapHome = page.locator('[data-test-id="map-home"]');
    await expect(mapHome).toBeVisible();
    await mapHome.click();

    // Zoom in
    const mapAdd = page.locator('[data-test-id="map-add"]');
    await expect(mapAdd).toBeVisible();
    await mapAdd.click();

    await expect(mapHome).toBeVisible();
    await mapHome.click();

    // Zoom out
    const mapRemove = page.locator('[data-test-id="map-remove"]');
    await expect(mapRemove).toBeVisible();
    await mapRemove.click();

    await expect(mapHome).toBeVisible();
    await mapHome.click();

    const uiToggle = page.locator('ui-toggle');
    await expect(uiToggle).toBeVisible();
    await uiToggle.click();

    await expect(mapHome).not.toBeVisible();
    await expect(mapAdd).not.toBeVisible();
    await expect(mapRemove).not.toBeVisible();

    await uiToggle.click();

    await expect(mapHome).toBeVisible();
    await expect(mapAdd).toBeVisible();
    await expect(mapRemove).toBeVisible();
  });
});
