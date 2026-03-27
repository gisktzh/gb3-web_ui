import {test, expect} from '../fixtures';

test.describe('Revitalisierungsplanung', () => {
  test('opens Gewässerökologie: Revitalisierungsplanung, returning its data in the info request', async ({
    page,
    openUrlWithCoordinates,
    filterForLayer,
    clickMapInTheList,
    useHar,
  }) => {
    await useHar();

    await openUrlWithCoordinates('2685889', '1250981');

    await filterForLayer('Gewässerökologie: Revitalisierungsplanung');
    await clickMapInTheList('Gewässerökologie: Revitalisierungsplanung');

    const map = page.locator('map-page');
    await expect(map).toBeVisible();
    await map.click();

    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'Länge [m]'}).locator('xpath=following-sibling::td')).toContainText('1654');
    await expect(page.locator('th', {hasText: 'Gewässername'}).locator('xpath=following-sibling::td')).toContainText('Schürgigraben');
  });
});
