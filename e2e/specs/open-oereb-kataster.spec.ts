import {test, expect} from '../fixtures';

test.describe('OEREB-Kataster', () => {
  test('opens the OEREB-Kataster and searches for a specific address, returning its data in the info request', async ({
    page,
    search,
    clickDefaultMapViewCenter,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await page.goto('/maps?topics=OerebKatasterZH');
    await page.waitForLoadState('networkidle');

    await search('Weststrasse 49, 8003');
    const zoomInput = page.locator('input.coordinate-scale-inputs__input[aria-label="Massstab anpassen"]');
    await expect(zoomInput).toHaveValue('750', {timeout: 30_000});

    await clickDefaultMapViewCenter();

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible({timeout: 30_000});
    await expect(page.locator('feature-info-content', {hasText: 'Markieren'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'BFSNr'}).locator('xpath=following-sibling::td')).toContainText('261');
    await expect(page.locator('th', {hasText: 'Nummer'}).locator('xpath=following-sibling::td')).toContainText('WD4055');
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH179170449958');
    await expect(page.locator('th', {hasText: 'Vollstaendigkeit'}).locator('xpath=following-sibling::td')).toContainText('Vollstaendig');
    await expect(page.locator('th', {hasText: 'Fläche'}).locator('xpath=following-sibling::td')).toContainText('544');
    await expect(page.locator('button', {hasText: 'Info drucken'})).toBeVisible();
  });
});
