import {test, expect} from '../fixtures';

test.describe('Legend', () => {
  test('loads and shows the legend', async ({page, openUrlWithCoordinates, filterForLayer, clickMapInTheList, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686');

    await filterForLayer('Amtliche Vermessung in Farbe');
    await clickMapInTheList('Amtliche Vermessung in Farbe');

    const legendButton = page.locator('button', {hasText: 'Legende'});
    await expect(legendButton).toBeVisible();

    await legendButton.click();

    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3', {hasText: 'Legende'})).toBeVisible();

    const avLegend = page.locator('legend', {hasText: 'Amtliche Vermessung in Farbe'});
    await expect(avLegend).toBeVisible();
    await avLegend.click();

    // Aniamtions etc.
    await page.waitForTimeout(200);

    await expect(page.locator('div.legend-item', {hasText: 'Nummern - Liegenschaften'})).toBeVisible();
    await expect(page.locator('div.legend-item', {hasText: 'Nummern - Projektierte Liegenschaften'})).toBeVisible();
    await expect(page.locator('div.legend-item', {hasText: 'Bodenbedeckung farbig'})).toBeVisible();

    await expect(page.locator('button', {hasText: 'Legende drucken'})).toBeVisible();
  });
});
