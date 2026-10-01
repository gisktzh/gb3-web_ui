import {test, expect} from '../fixtures';

test.describe('Map pan/zoom/rotate', () => {
  test('Moves the map around and updates scale/pos', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.setTimeout(60_000);

    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2684549', '1253620');

    const zoomInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Massstab anpassen"]');
    const coordsInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Koordinaten eingeben"]');
    const map = page.locator('map-page canvas').first();

    await expect(zoomInput).toBeVisible();
    await expect(coordsInput).toBeVisible();

    async function waitForScaleToSettle(): Promise<number> {
      let previousValue = '';
      let stableReads = 0;

      await expect
        .poll(
          async () => {
            const currentValue = await zoomInput.inputValue();
            stableReads = currentValue === previousValue ? stableReads + 1 : 0;
            previousValue = currentValue;
            return stableReads;
          },
          {intervals: [100, 200, 300]},
        )
        .toBeGreaterThanOrEqual(2);

      return Number(previousValue);
    }

    // Prepare initial scale and coords.
    await zoomInput.fill('1000');
    await expect(zoomInput).toHaveValue('1000');

    const box = await map.boundingBox();
    expect(box).not.toBeNull();
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;

    // Mouse wheel zoom
    await page.mouse.move(startX, startY);
    await page.mouse.wheel(0, 200);

    await expect.poll(async () => Number(await zoomInput.inputValue())).toBeGreaterThan(1000);
    const zoomValueAfterWheelOut = await waitForScaleToSettle();

    const coordsAfterWheelOut = (await coordsInput.inputValue())?.split(' / ');
    // Should be roughly the same ballpark numbers
    expect(coordsAfterWheelOut[0]).toMatch(/^2684\d{3}/);
    expect(coordsAfterWheelOut[1]).toMatch(/^1253\d{3}/);

    await page.mouse.wheel(0, -200);

    await expect.poll(async () => Number(await zoomInput.inputValue())).toBeLessThan(zoomValueAfterWheelOut);
    const zoomValueAfterWheelIn = await waitForScaleToSettle();

    // Panning with dragging
    const coordsBeforePan = await coordsInput.inputValue();

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 200, startY + 100, {steps: 20});
    await page.mouse.up();

    await expect.poll(() => coordsInput.inputValue()).not.toBe(coordsBeforePan);
    await expect(zoomInput).toHaveValue(zoomValueAfterWheelIn.toString());
    const coordsAfterPan = (await coordsInput.inputValue())?.split(' / ');
    // Should be roughly the same ballpark numbers
    expect(coordsAfterPan[0]).toMatch(/^2684\d{3}/);
    expect(coordsAfterPan[1]).toMatch(/^1253\d{3}/);

    // Set extent by drawing a rectangle
    await page.keyboard.down('Shift');
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 200, startY + 100, {steps: 20});
    await page.mouse.up();
    await page.keyboard.up('Shift');

    await expect.poll(async () => Number(await zoomInput.inputValue())).toBeLessThan(zoomValueAfterWheelIn);
    await waitForScaleToSettle();
    const coordsAfterExtentZoom = (await coordsInput.inputValue())?.split(' / ');
    // Should be roughly the same ballpark numbers
    expect(coordsAfterExtentZoom[0]).toMatch(/^2684\d{3}/);
    expect(coordsAfterExtentZoom[1]).toMatch(/^1253\d{3}/);

    // Via buttons
    const zoomControls = page.locator('zoom-controls');
    const fullMapButton = zoomControls.locator('button[aria-label="Ganze Karte anzeigen"]');
    await expect(fullMapButton).toBeVisible();
    await fullMapButton.click();

    await expect(zoomInput).toHaveValue('270018');
    await expect(coordsInput).toHaveValue('2693065 / 1253620');

    const zoomInButton = zoomControls.locator('button[aria-label="Vergrössern"]');
    await expect(zoomInButton).toBeVisible();
    await zoomInButton.click();
    await expect(zoomInput).toHaveValue('144448');
    await expect(coordsInput).toHaveValue('2693065 / 1253620');

    const zoomOutButton = zoomControls.locator('button[aria-label="Verkleinern"]');
    await expect(zoomOutButton).toBeVisible();
    await zoomOutButton.click();
    await expect(zoomInput).toHaveValue('288895');
    await expect(coordsInput).toHaveValue('2693065 / 1253620');

    // The compass is the observable UI contract for the current rotation. Raw
    // right-button pointer capture is browser-engine dependent and belongs in a
    // small dedicated gesture test rather than this map workflow.
    const compassIcon = page.locator('mat-icon', {hasText: 'explore'});
    const compassTransform = await compassIcon.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('transform');
    });
    expect(compassTransform).not.toBe('none');
  });
});
