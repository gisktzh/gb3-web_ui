import {test, expect} from '../fixtures';

test.describe('Revitalisierungsplanung', () => {
  test('opens Gewässerökologie: Revitalisierungsplanung, returning its data in the info request', async ({
    page,
    openUrlWithCoordinates,
    filterForLayer,
    clickMapInTheList,
    clickDefaultMapViewCenter,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2685889', '1250981');

    await filterForLayer('Gewässerökologie: Revitalisierungsplanung');
    await clickMapInTheList('Gewässerökologie: Revitalisierungsplanung');

    await clickDefaultMapViewCenter();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'Länge [m]'}).locator('xpath=following-sibling::td')).toContainText('1654');
    await expect(page.locator('th', {hasText: 'Gewässername'}).locator('xpath=following-sibling::td')).toContainText('Schürgigraben');
  });
});
