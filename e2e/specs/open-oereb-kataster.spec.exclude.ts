import {test, expect} from '../fixtures';

test.describe('OEREB-Kataster', () => {
  test.only('opens the OEREB-Kataster and searches for a specific address, returning its data in the info request', async ({
    page,
    search,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await page.goto('/maps?initialMapIds=OerebKatasterZH');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    await search('Weststrasse 49, 8003');

    const map = page.locator('map-page');
    await expect(map).toBeVisible();

    await map.click({force: true});
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
    await expect(page.locator('feature-info-content', {hasText: 'Markieren'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'BFSNr'}).locator('xpath=following-sibling::td')).toContainText('261');
    await expect(page.locator('th', {hasText: 'Nummer'}).locator('xpath=following-sibling::td')).toContainText('WD4055');
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH179170449958');
    await expect(page.locator('th', {hasText: 'Vollstaendigkeit'}).locator('xpath=following-sibling::td')).toContainText('Vollstaendig');
    await expect(page.locator('th', {hasText: 'Fläche'}).locator('xpath=following-sibling::td')).toContainText('544');
    await expect(page.locator('button', {hasText: 'Info drucken'})).toBeVisible();
  });
});
