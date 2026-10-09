import {test, describeA11y} from '../fixtures';

const DATASET_NAME = 'Abflussprozesskarte';

test.describe('Data catalogue', () => {
  test('shows the catalogue overview and a dataset detail page', async ({
    openDataCatalogueOverview,
    openDatasetDetailPage,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openDataCatalogueOverview();
    await openDatasetDetailPage(DATASET_NAME);
  });

  describeA11y(() => {
    test('has no detectable accessibility violations on the overview and a detail page', async ({
      useHar,
      captureConsole,
      openDataCatalogueOverview,
      openDatasetDetailPage,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      await openDataCatalogueOverview();

      // First distinct state: the catalogue overview/listing.
      await checkA11y();

      await openDatasetDetailPage(DATASET_NAME);

      // Second distinct state: a resource detail page. The navbar/footer chrome around it is unchanged (and was
      // already scanned above), so scope this scan to the routed content only to avoid re-scanning it.
      await checkA11y({include: ['.data-catalogue__content']});
    });
  });
});
