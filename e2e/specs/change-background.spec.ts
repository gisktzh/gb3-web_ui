import {Locator} from '@playwright/test';
import {test, expect} from '../fixtures';

test.describe('Map operation', () => {
  test('changes base map when selecting', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    async function assertBackgroundImage(locator: Locator, url: string) {
      const backgroundImage = await locator.evaluate((el) => {
        return globalThis.getComputedStyle(el).getPropertyValue('background-image');
      });

      expect(backgroundImage).toBe(url);
    }

    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2685889', '1250981');

    const baseMapSelector = page.locator('basemap-selector button');
    await expect(baseMapSelector).toBeVisible();
    await assertBackgroundImage(baseMapSelector, 'url("http://localhost:4200/assets/images/basemaps/arelkbackgroundzh.webp")');

    await baseMapSelector.click();

    // Aniamtions etc.
    await page.waitForTimeout(200);

    const historicMap = page.locator('button', {hasText: 'Historische Karte J. Wild (~1850)'});
    await expect(historicMap).toBeVisible();

    await historicMap.click();

    // Aniamtions etc.
    await page.waitForTimeout(200);

    await assertBackgroundImage(baseMapSelector, 'url("http://localhost:4200/assets/images/basemaps/arewildbackgroundzh.webp")');
  });
});
