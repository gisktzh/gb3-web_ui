import {test, expect} from '../fixtures';

test.describe('Layer navigation', () => {
  test('reorders and shows/hides layers and changes their opacity', async ({
    page,
    useHar,
    openUrlWithCoordinates,
    captureConsole,
    filterForLayer,
    clickMapInTheList,
  }) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686');

    await filterForLayer('Amtliche Vermessung in Farbe');
    await clickMapInTheList('Amtliche Vermessung in Farbe');

    const map = page.locator('canvas');

    await page
      .getByRole('button', {name: 'Amtliche Vermessung in Farbe Amtliche Vermessung in Farbe'})
      .locator('[data-test-id="show-layers-of-the-map"]')
      .click();
    await expect(map).toBeVisible();
    await page.locator('#mat-mdc-checkbox-41-input').uncheck();
    await expect(map).toBeVisible();
    await page.locator('#mat-mdc-checkbox-42-input').uncheck();
    await expect(map).toBeVisible();
    await page.locator('#mat-mdc-checkbox-43-input').uncheck();
    await expect(map).toBeVisible();

    await page.getByRole('button', {name: 'Einstellungen'}).click();
    await page.getByRole('slider').fill('0.5');
    await expect(map).toBeVisible();

    await page.getByRole('button', {name: 'Ebenen'}).click();
    const handle = page.locator(
      'div:nth-child(5) > active-map-item-layer > .active-map-item-layer > .active-map-item-layer__drag-handle > .cdk-drag-handle.active-map-item-layers__item__drag-handle',
    );
    await handle.hover();
    await page.mouse.down();
    await page.waitForTimeout(1000);
    await page.mouse.move(0, 0, {steps: 20});
    await page.waitForTimeout(1000);
    await page.mouse.up();

    const firstHandle = await page.locator('.cdk-drag.active-map-item-layers__item').first();
    await expect(firstHandle).toContainText('Grenzpunkte');
  });
});
