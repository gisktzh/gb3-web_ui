import {test, expect} from '../fixtures';

test.describe('Overview page', () => {
  test('shows the most important parts', async ({page, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1', {hasText: 'Geoportal'})).toBeVisible();
    await expect(page.locator('gis-browser-teaser')).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Häufig verwendet'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'News'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Karten entdecken'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Weiterführende Informationen'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Kontakt'})).toBeVisible();
    await expect(page.locator('a', {hasText: 'Hilfecenter Geoportal Kanton Zürich'})).toBeVisible();

    const startGisBrowserLink = page.locator('a', {hasText: 'GIS-Browser starten'});
    await expect(startGisBrowserLink).toBeVisible();

    await startGisBrowserLink.click();

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/maps');
  });
});
