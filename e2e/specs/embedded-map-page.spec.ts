import {expect, test} from '../fixtures';

const shareLinkId = 'e2e-embedded-map';
const emptyVectorLayer = {
  type: 'Vector',
  geojson: {type: 'FeatureCollection', features: []},
  styles: {},
};

test.describe('Embedded map page', () => {
  test('only renders the map chrome inside an iframe and links back to the full browser', async ({page}) => {
    await page.route('https://maps.zh.ch/.well-known/openid-configuration', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          issuer: 'https://maps.zh.ch/',
          authorization_endpoint: 'https://maps.zh.ch/gb3/v4/auth/authorize',
          token_endpoint: 'https://maps.zh.ch/gb3/v4/auth/token',
          userinfo_endpoint: 'https://maps.zh.ch/gb3/v4/auth/userinfo',
          jwks_uri: 'https://maps.zh.ch/gb3/v4/auth/jwks',
          scopes_supported: ['openid', 'profile'],
          response_types_supported: ['code'],
          code_challenge_methods_supported: ['S256'],
        }),
      });
    });
    await page.route('https://maps.zh.ch/gb3/v4/auth/jwks', async (route) => {
      await route.fulfill({contentType: 'application/json', body: JSON.stringify({keys: []})});
    });
    await page.route(`**/favorites/${shareLinkId}`, async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: shareLinkId,
          owner: null,
          east: 2683000,
          north: 1248000,
          scaledenom: 10000,
          basemap: 'arelkbackgroundzh',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
          content: [],
          drawings: emptyVectorLayer,
          measurements: emptyVectorLayer,
        }),
      });
    });
    await page.route('**/topics', async (route) => {
      await route.fulfill({contentType: 'application/json', body: JSON.stringify({categories: []})});
    });

    await page.goto(`/e/${shareLinkId}`);

    const topLevelPage = page.locator('embedded-map-page');
    await expect(topLevelPage).toContainText('Diese Karte des GIS Browser Zürich muss in einem iframe verwendet werden.');
    await expect(topLevelPage.locator('.embedded-map-page')).toHaveCount(0);

    await page.setContent(`<iframe title="Embedded GIS map" src="/e/${shareLinkId}"></iframe>`);

    const embeddedPage = page.frameLocator('iframe[title="Embedded GIS map"]').locator('embedded-map-page');
    await expect(embeddedPage.locator('.embedded-map-page')).toBeVisible();
    await expect(embeddedPage).not.toContainText('muss in einem iframe verwendet werden');

    const fullBrowserLink = embeddedPage.locator('.embedded-map-page__minified-header');
    await expect(fullBrowserLink).toHaveAttribute('href', `/s/${shareLinkId}`);
    await expect(fullBrowserLink).toHaveAttribute('target', '_blank');
    await expect(fullBrowserLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
