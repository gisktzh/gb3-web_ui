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

    const map = page.locator('map-page canvas').first();
    const activeMapItem = page.locator('active-map-item').filter({hasText: 'Amtliche Vermessung in Farbe'}).first();
    await activeMapItem.locator('[data-test-id="show-layers-of-the-map"]').click();
    await expect(map).toBeVisible();

    const layerRows = activeMapItem.locator('.active-map-item-layers__item');
    await expect(layerRows.first()).toBeVisible();
    for (const index of [0, 1, 2]) {
      const checkbox = layerRows.nth(index).getByRole('checkbox');
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    }

    await activeMapItem.getByRole('button', {name: 'Einstellungen'}).click();
    const opacitySlider = activeMapItem.getByRole('slider');
    await opacitySlider.fill('0.5');
    await expect(opacitySlider).toHaveValue('0.5');

    await activeMapItem.getByRole('button', {name: 'Ebenen'}).click();
    const firstLayer = layerRows.first();
    const boundaryPointsLayer = layerRows.filter({has: page.getByText('Grenzpunkte', {exact: true})});
    await expect(boundaryPointsLayer).toHaveCount(1);

    const sourceHandle = boundaryPointsLayer.locator('.active-map-item-layer__drag-handle__icon');
    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await firstLayer.boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, sourceBox!.y + sourceBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, sourceBox!.y - 10, {steps: 2});
    await page.mouse.move(targetBox!.x + targetBox!.width / 2, targetBox!.y + 2, {steps: 20});
    await page.mouse.up();

    await expect(layerRows.first()).toContainText('Grenzpunkte');
  });
});
