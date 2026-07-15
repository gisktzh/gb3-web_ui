import {test, expect} from '../fixtures';

test.describe('Printing', () => {
  test('creates a print job and downloads the file', async ({
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
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);

    await filterForLayer('Amtliche Vermessung in Farbe');
    await clickMapInTheList('Amtliche Vermessung in Farbe');

    const printDialogButton = page.locator('[data-test-id="map-print"]');
    await expect(printDialogButton).toBeVisible();

    await printDialogButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('.print-dialog')).toBeVisible();

    const titleField = page.locator('[data-test-id="input-print-title"]');
    await expect(titleField).toBeVisible();

    await titleField.focus();
    await titleField.clear();
    await titleField.fill('Some title');

    const commentField = page.locator('[data-test-id="input-print-comment"]');
    await expect(commentField).toBeVisible();

    await commentField.focus();
    await commentField.clear();
    await commentField.fill('Some comment');

    const rotationField = page.locator('[data-test-id="input-print-rotation"]');
    await expect(rotationField).toBeVisible();

    await rotationField.focus();
    await rotationField.clear();
    await rotationField.fill('23');

    const scaleField = page.locator('[data-test-id="input-print-scale"]');
    await expect(scaleField).toBeVisible();

    await scaleField.focus();
    await scaleField.clear();
    await scaleField.fill('600');

    const layoutField = page.locator('[data-test-id="input-print-layout"]');
    await expect(layoutField).toBeVisible();
    await layoutField.click();
    const layoutOptions = await layoutField.locator('mat-option').all();
    await expect(layoutOptions.length).toBe(5);
    await layoutOptions[2].click();
    await expect(layoutField).toContainText('A2');

    const dpiField = page.locator('[data-test-id="input-print-dpi"]');
    await expect(dpiField).toBeVisible();
    await dpiField.click();
    const dpiOptions = await dpiField.locator('mat-option').all();
    await expect(dpiOptions.length).toBe(2);
    await dpiOptions[0].click();
    await expect(dpiField).toContainText('150');

    const submitButton = page.locator('[data-test-id="submit-print-from"]');

    const downloadPromise = page.waitForEvent('download');

    await submitButton.click();

    const download = await downloadPromise;
    const suggestedFileName = download.suggestedFilename();
    await expect(suggestedFileName).toContain('geoportal_zh_A2_hoch_');
    await expect(suggestedFileName).toContain('.pdf');
  });
});
