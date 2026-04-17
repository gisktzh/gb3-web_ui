import {test, expect} from '../fixtures';

test.describe('Attribute filters', () => {
  test('triggers new WMS requests when attribute filters are applied', async ({
    page,
    useHar,
    captureConsole,
    openUrlWithCoordinates,
    selectTopic,
    clickMapInTheList,
  }) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702604', '1241901');

    await selectTopic('Raumplanung, Zonenpläne');

    await clickMapInTheList('Gebäudealter');

    await page.waitForLoadState('networkidle');

    await page.locator('div.active-map-item-header [data-test-id="show-layers-of-the-map"] mat-icon').click({force: true});

    await page.getByText('Einstellungen').click();
    await page.getByText('Attributfilter').click();

    await expect(page.getByRole('heading', {name: 'Gebäudealter'})).toBeVisible();

    const [request1] = await Promise.all([
      page.waitForRequest((req) => req.url().startsWith('https://wms.zh.ch/StatGebAlterZH')),
      page.getByText('Gewerbe und Verwaltung').click({force: true}),
    ]);
    expect(request1).toBeTruthy();

    const [request2] = await Promise.all([
      page.waitForRequest((req) => req.url().startsWith('https://wms.zh.ch/StatGebAlterZH')),
      page.getByText('Andere').click({force: true}),
    ]);
    expect(request2).toBeTruthy();
  });
});
