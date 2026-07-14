import {test, expect} from '../fixtures';

test.describe('Map pan/zoom/rotate', () => {
  test('Moves the map around and updates scale/pos', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2684549', '1253620');

    const zoomInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Massstab anpassen"]');
    const coordsInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Koordinaten eingeben"]');
    const map = page.locator('canvas');

    await expect(zoomInput).toBeVisible();
    await expect(coordsInput).toBeVisible();

    // Prepare initial scale and coords.
    await zoomInput.fill('1000');

    await page.waitForTimeout(100);

    // Mouse wheel zoom
    await page.mouse.move(1920 / 2, 1080 / 2);
    await page.waitForTimeout(20);
    await page.mouse.wheel(0, 200);

    await page.waitForTimeout(1000);

    const zoomValueAfterWheelOut = Number(await zoomInput.inputValue());
    await expect(zoomValueAfterWheelOut).toBeGreaterThan(1000);

    const coordsAfterWheelOut = (await coordsInput.inputValue())?.split(' / ');
    if (coordsAfterWheelOut) {
      // Should be roughly the same ballpark numbers
      await expect(coordsAfterWheelOut[0]).toMatch(/^2684\d{3}/);
      await expect(coordsAfterWheelOut[1]).toMatch(/^1253\d{3}/);
    }

    await page.mouse.wheel(0, -200);

    await page.waitForTimeout(500);

    await expect(zoomInput).toHaveValue('1000');
    const zoomValueAfterWheelIn = Number(await zoomInput.inputValue());
    await expect(zoomValueAfterWheelIn).toBeLessThan(zoomValueAfterWheelOut);

    await page.waitForTimeout(250);

    // Panning with dragging
    const box = await map.boundingBox();
    await expect(box).not.toBeNull();
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 200, startY + 100, {steps: 20});
    await page.mouse.up();

    await page.waitForTimeout(250);

    await expect(zoomInput).toHaveValue('1000');
    const coordsAfterPan = (await coordsInput.inputValue())?.split(' / ');
    if (coordsAfterPan) {
      // Should be roughly the same ballpark numbers
      await expect(coordsAfterPan[0]).toMatch(/^2684\d{3}/);
      await expect(coordsAfterPan[1]).toMatch(/^1253\d{3}/);
    }

    // Set extent by drawing a rectangle
    await page.keyboard.down('Shift');
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 200, startY + 100, {steps: 20});
    await page.mouse.up();
    await page.keyboard.up('Shift');

    await expect(zoomInput).toHaveValue('99');
    const coordsAfterExtentZoom = (await coordsInput.inputValue())?.split(' / ');
    if (coordsAfterExtentZoom) {
      // Should be roughly the same ballpark numbers
      await expect(coordsAfterExtentZoom[0]).toMatch(/^2684\d{3}/);
      await expect(coordsAfterExtentZoom[1]).toMatch(/^1253\d{3}/);
    }

    // Via buttons
    const zoomControls = page.locator('zoom-controls');
    const fullMapButton = zoomControls.locator('button[aria-label="Ganze Karte anzeigen"]');
    await expect(fullMapButton).toBeVisible();
    await fullMapButton.click();

    await page.waitForTimeout(250);

    await expect(zoomInput).toHaveValue('270018');
    await expect(coordsInput).toHaveValue('2682563 / 1253620');

    const zoomInButton = zoomControls.locator('button[aria-label="Vergrössern"]');
    await expect(zoomInButton).toBeVisible();
    await zoomInButton.click();
    await expect(zoomInput).toHaveValue('144448');
    await expect(coordsInput).toHaveValue('2682563 / 1253620');

    const zoomOutButton = zoomControls.locator('button[aria-label="Verkleinern"]');
    await expect(zoomOutButton).toBeVisible();
    await zoomOutButton.click();
    await expect(zoomInput).toHaveValue('288895');
    await expect(coordsInput).toHaveValue('2682563 / 1253620');

    // For some reason, RMB mousedowns lose the pointer capture immediately upon getting it
    // both via Playwright and direct native CDP. For that reason, RMB drag events are not registered
    // correctly and the rotation doesn't aactually happen. This is likely a Chromium bug.
    // TODO: Update Chromium/Playwright and re-check every once in a while.

    const compassIcon = page.locator('mat-icon', {hasText: 'explore'});
    const transformBefore = await compassIcon.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('transform');
    });
    // rotate(45) gets evaluated to a matrix.
    await expect(transformBefore).toBe('matrix(0.707107, -0.707107, 0.707107, 0.707107, 0, 0)');

    await page.mouse.move(startX, startY);
    await page.waitForTimeout(250);
    await page.mouse.down({button: 'right'});
    await page.waitForTimeout(500);
    await page.mouse.move(startX + 200, startY + 100, {steps: 20});
    await page.waitForTimeout(500);
    await page.mouse.up({button: 'right'});

    await page.waitForTimeout(500);

    const transformAfter = await compassIcon.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('transform');
    });
    await expect(transformAfter).toBe('matrix(0.707107, -0.707107, 0.707107, 0.707107, 0, 0)');
  });
});
