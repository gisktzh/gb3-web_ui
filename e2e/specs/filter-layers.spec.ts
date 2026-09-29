import {test, expect, describeA11y} from '../fixtures';

test.describe('Filter layers', () => {
  test('filters layers according to given search terms', async ({
    page,
    openMapForLayerFiltering,
    filterForLayer,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openMapForLayerFiltering('300', '300');

    // --- Filter Strassennetz layer ---
    await filterForLayer('Strassennetz');

    await expect(page.locator('p', {hasText: 'Wasser'})).not.toBeVisible();
    await expect(page.locator('p', {hasText: 'Integrale Strassennetzkonzeption (ISK)'})).toBeVisible();

    // --- Try another layer ---
    await filterForLayer('Verkehrstechnik (BSA)');

    await expect(page.locator('p', {hasText: 'Raumplanung, Zonenpläne'})).not.toBeVisible();
    await expect(page.locator('p', {hasText: 'Verkehrstechnik (BSA)'})).toBeVisible();
  });

  describeA11y(() => {
    test('has no detectable accessibility violations while browsing/filtering the map catalogue', async ({
      page,
      openMapForLayerFiltering,
      filterForLayer,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      await openMapForLayerFiltering('300', '300');

      await filterForLayer('Strassennetz');
      await expect(page.locator('p', {hasText: 'Integrale Strassennetzkonzeption (ISK)'})).toBeVisible();

      await checkA11y();
    });
  });
});
