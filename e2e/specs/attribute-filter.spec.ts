import {test, expect} from '../fixtures';

test.describe('Attribute filters', () => {
  test('triggers new WMS requests when attribute filters are applied', async ({
    page,
    useHar,
    openUrlWithCoordinates,
    selectTopic,
    clickMapInTheList,
  }) => {
    await useHar();

    await openUrlWithCoordinates('2702604', '1241901');

    await selectTopic('Raumplanung, Zonenpläne');

    await clickMapInTheList('Gebäudealter');

    await page.waitForLoadState('networkidle');

    await page.locator('div.active-map-item-header [data-test-id="show-layers-of-the-map"] mat-icon').click({force: true});

    await page.getByText('Einstellungen').click();
    await page.getByText('Attributfilter').click();

    await expect(page.getByRole('heading', {name: 'Gebäudealter'})).toBeVisible();

    await Promise.all([
      page.waitForResponse((response) => response.url().startsWith('https://wms.zh.ch/StatGebAlterZH') && response.status() === 200, {
        timeout: 0,
      }),
      page.getByText('Gewerbe und Verwaltung').click(),
    ]);

    await Promise.all([
      page.waitForResponse((response) => response.url().startsWith('https://wms.zh.ch/StatGebAlterZH') && response.status() === 200, {
        timeout: 0,
      }),
      page.getByText('Andere').click(),
    ]);
  });
});
