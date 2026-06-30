import {test, expect} from '../fixtures';

test.describe('Map with URL', () => {
  test('opens specific maps via URL parameters', async ({page, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await page.goto('/maps?initialMapIds=OrthoZH,AVfarbigZH');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('active-map-item-header', {hasText: 'Orthofoto'})).toBeVisible();
    await expect(page.locator('active-map-item-header', {hasText: 'Amtliche Vermessung in Farbe'})).toBeVisible();

    await page.goto('/maps?initialMapIds=OerebKatasterZH');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('active-map-item-header', {hasText: 'Orthofoto'})).not.toBeVisible();
    await expect(page.locator('active-map-item-header', {hasText: 'Amtliche Vermessung in Farbe'})).not.toBeVisible();
    await expect(page.locator('active-map-item-header', {hasText: 'ÖREB-Kataster'})).toBeVisible();
  });
});
