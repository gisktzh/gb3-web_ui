import {test, expect} from '../fixtures';

test.describe('Overview page', () => {
  test('shows the most important parts', async ({page, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await page.goto('/', {waitUntil: 'domcontentloaded'});

    await expect(page.locator('h1', {hasText: 'Geoportal'})).toBeVisible();
    await expect(page.locator('gis-browser-teaser')).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Häufig verwendet'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'News'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Karten entdecken'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Weiterführende Informationen'})).toBeVisible();
    await expect(page.locator('h2', {hasText: 'Kontakt'})).toBeVisible();
    await expect(page.locator('a', {hasText: 'Hilfecenter Geoportal Kanton Zürich'})).toBeVisible();

    const startGisBrowserLink = page.getByRole('link', {name: /GIS-Browser starten/});
    await expect(startGisBrowserLink).toBeVisible();
    await expect(startGisBrowserLink).toHaveAttribute('href', '/maps');

    // The overview recording has no map API responses; reuse the map recording for navigation.
    await page.routeFromHAR('e2e/hars/open-map-with-url.har', {notFound: 'fallback'});
    await startGisBrowserLink.click();
    await expect(page).toHaveURL(/\/maps(?:[?#]|$)/, {timeout: 30_000});
  });
});
