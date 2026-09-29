import {test, expect, describeA11y} from '../fixtures';

test.describe('Overview page', () => {
  test('shows the most important parts', async ({page, useHar, captureConsole, openHomePage}) => {
    await useHar();
    captureConsole();

    await openHomePage();

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

    await startGisBrowserLink.click();
    await expect(page).toHaveURL(/\/maps(?:[?#]|$)/, {timeout: 30_000});
  });

  describeA11y(() => {
    test('has no detectable accessibility violations', async ({useHar, captureConsole, openHomePage, checkA11y}) => {
      await useHar();
      captureConsole();

      await openHomePage();

      await checkA11y();
    });
  });
});
