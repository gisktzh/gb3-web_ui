import {test, expect} from '../fixtures';

test.describe('OEREB Extract', () => {
  test('Opens the dynamic extract when an OEREB map is loaded', async ({
    page,
    login,
    openUrlWithCoordinates,
    useHar,
    captureConsole,
    filterForLayer,
    clickMapInTheList,
  }) => {
    test.setTimeout(60_000);

    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2684549', '1253620');

    await login();

    const gisBrowser = page.locator('span', {hasText: 'GIS-Browser'}).last();
    await gisBrowser.scrollIntoViewIfNeeded();
    await gisBrowser.click();

    await filterForLayer('ÖREB-Kataster Raumplanung');
    await clickMapInTheList('ÖREB-Kataster Raumplanung');

    await page.mouse.click(600, 600);

    await page.waitForLoadState('networkidle');

    const oerebExtract = page.locator('oereb-extract');
    await expect(oerebExtract).toBeVisible();

    // Random samples of data
    const parcelInfo = page.locator('.list-item__content.list-item__content--is-nested').first();
    await expect(parcelInfo).toContainText('Opfikon');
    await expect(parcelInfo).toContainText('Vollständig');
    await expect(parcelInfo).toContainText('29640');
    await expect(page.locator('.list-item__content.list-item__content--is-nested').nth(1)).toContainText('Gossweiler Ingenieure AG');
    await expect(page.locator('map-overlay-list-item').first()).toContainText('Nutzungsplanung (kantonal/kommunal): Grundnutzungen');
    await expect(page.locator('map-overlay-list-item p', {hasText: 'Wohnzone, 2-geschossig, dicht (W2D)'}).first()).toBeVisible();
    await expect(page.locator('.oereb-info-list').first()).toContainText('Rechtsstatus rechtskräftig');
  });
});
