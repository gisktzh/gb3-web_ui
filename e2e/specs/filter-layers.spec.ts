import {test, expect} from '../fixtures';

test.describe('Filter layers', () => {
  test('filters layers according to given search terms', async ({page, openUrlWithCoordinates, filterForLayer, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('300', '300');

    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(200);

    // --- Filter Strassennetz layer ---
    await filterForLayer('Strassennetz');

    await expect(page.locator('p', {hasText: 'Wasser'})).not.toBeVisible();
    await expect(page.locator('p', {hasText: 'Integrale Strassennetzkonzeption (ISK)'})).toBeVisible();

    // --- Try another layer ---
    await filterForLayer('Verkehrstechnik (BSA)');

    await expect(page.locator('p', {hasText: 'Raumplanung, Zonenpläne'})).not.toBeVisible();
    await expect(page.locator('p', {hasText: 'Verkehrstechnik (BSA)'})).toBeVisible();
  });
});
