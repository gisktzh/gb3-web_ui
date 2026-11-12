import {test, describeA11y, expect} from '../fixtures';

const DATASET_NAME = 'Abflussprozesskarte';

test.describe('Data catalogue', () => {
  test('shows the catalogue overview and a dataset detail page', async ({
    page,
    openDataCatalogueOverview,
    openDatasetDetailPage,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openDataCatalogueOverview();
    await openDatasetDetailPage(DATASET_NAME);
    // This is here to satisfy SonarQube a bit...
    await expect(page).toHaveURL(/\/data\/datasets\//);
  });

  describeA11y(() => {
    test('has no detectable accessibility violations on the overview and a detail page', async ({
      page,
      useHar,
      captureConsole,
      openDataCatalogueOverview,
      openDatasetDetailPage,
    }) => {
      await useHar();
      captureConsole();

      await openDataCatalogueOverview();

      // First distinct state: the catalogue overview/listing.
      await expect(page).toNotHaveAccessibilityViolations();

      await openDatasetDetailPage(DATASET_NAME);

      // Second distinct state: a resource detail page. The navbar/footer chrome around it is unchanged (and was
      // already scanned above), so scope this scan to the routed content only to avoid re-scanning it.
      await expect(page).toNotHaveAccessibilityViolations({include: ['.data-catalogue__content']});
    });
  });
});
