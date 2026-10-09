import {test, expect, describeA11y} from '../fixtures';

test.describe('Legend', () => {
  test('loads and shows the legend', async ({page, openLegend, useHar, captureConsole}) => {
    await useHar();
    captureConsole();

    await openLegend('2702555', '1241686', 'Amtliche Vermessung in Farbe');

    // Aniamtions etc.
    await expect(page.locator('div.legend-item', {hasText: 'Nummern - Liegenschaften'})).toBeVisible();
    await expect(page.locator('div.legend-item', {hasText: 'Nummern - Projektierte Liegenschaften'})).toBeVisible();
    await expect(page.locator('div.legend-item', {hasText: 'Bodenbedeckung farbig'})).toBeVisible();

    await expect(page.locator('button', {hasText: 'Legende drucken'})).toBeVisible();
  });

  describeA11y(() => {
    test('has no detectable accessibility violations while showing the legend', async ({
      page,
      openLegend,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      await openLegend('2702555', '1241686', 'Amtliche Vermessung in Farbe');
      await expect(page.locator('div.legend-item', {hasText: 'Nummern - Liegenschaften'})).toBeVisible();

      await checkA11y();
    });
  });
});
