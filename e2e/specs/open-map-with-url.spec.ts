import {test, expect} from '../fixtures';

test.describe('Map with URL', () => {
  test('opens specific maps via URL parameters', async ({page, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await page.goto('/maps?initialMapIds=OrthoZH,AVfarbigZH');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('active-map-item-header', {hasText: 'Orthofoto'})).toBeVisible();
    await expect(page.locator('active-map-item-header', {hasText: 'Amtliche Vermessung in Farbe'})).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get('topics')).toBe('OrthoZH,AVfarbigZH');
    expect(new URL(page.url()).searchParams.has('initialMapIds')).toBe(false);

    await page.goto('/maps?topics=OerebKatasterZH,UnknownTopic');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('active-map-item-header', {hasText: 'Orthofoto'})).not.toBeVisible();
    await expect(page.locator('active-map-item-header', {hasText: 'Amtliche Vermessung in Farbe'})).not.toBeVisible();
    await expect(page.locator('active-map-item-header', {hasText: 'ÖREB-Kataster'})).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get('topics')).toBe('OerebKatasterZH');

    // The header options are only revealed on hover, so the delete button has to be hovered into view first.
    const oerebKatasterHeader = page.locator('active-map-item-header', {hasText: 'ÖREB-Kataster'});
    await oerebKatasterHeader.locator('div.active-map-item-header').hover();
    await oerebKatasterHeader.locator('[data-test-id="delete"]').click();
    await expect.poll(() => new URL(page.url()).searchParams.has('topics')).toBe(false);
  });
});
