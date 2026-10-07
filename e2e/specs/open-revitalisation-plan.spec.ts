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

    const activeMapItem = page.locator('active-map-item').filter({hasText: 'Gewässerökologie: Revitalisierungsplanung'}).first();
    await expect(activeMapItem.locator('mat-progress-bar')).toHaveCount(0, {timeout: 30_000});

    await clickDefaultMapViewCenter();

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible({timeout: 30_000});
    await expect(page.locator('th', {hasText: 'Länge [m]'}).locator('xpath=following-sibling::td')).toContainText('1654');
    await expect(page.locator('th', {hasText: 'Gewässername'}).locator('xpath=following-sibling::td')).toContainText('Schürgigraben');
  });
});
