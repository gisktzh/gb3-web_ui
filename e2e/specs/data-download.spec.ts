import {test, expect, describeA11y} from '../fixtures';

test.describe('Data download', () => {
  test('downloads specified data', async ({
    page,
    useHar,
    openDataDownloadSelectionTools,
    openMunicipalityDownloadDialog,
    selectMunicipalityAndContinue,
    captureConsole,
  }) => {
    test.setTimeout(120_000);

    await useHar();
    captureConsole();

    const dataDownloadSelectionTools = await openDataDownloadSelectionTools('2702555', '1241686', 'Amtliche Vermessung in Farbe');
    const municipalityDownloadDialog = await openMunicipalityDownloadDialog(dataDownloadSelectionTools);
    const dataDownloadDialog = await selectMunicipalityAndContinue(municipalityDownloadDialog, 'Volken');
    const activeMapItemsList = dataDownloadDialog.locator('expandable-list-item[header="Geodaten zu den Aktiven Karten"]');
    const remainingGeoDataItemsList = dataDownloadDialog.locator('expandable-list-item[header="Restliche Geodaten"]');

    await expect(remainingGeoDataItemsList).toContainText('Abflussprozesskarte (OGD)');

    const dataDownloadFilterInput = dataDownloadDialog.locator('input[placeholder="Nach Geodaten filtern"]');
    await expect(dataDownloadFilterInput).toBeVisible();
    await dataDownloadFilterInput.focus();
    await dataDownloadFilterInput.clear();
    await dataDownloadFilterInput.fill('Amtliche Vermessung');

    await expect(activeMapItemsList).toBeVisible();
    await expect(activeMapItemsList).toContainText('Amtliche Vermessung - Datenmodell CH (OGD)');
    await expect(activeMapItemsList).toContainText('Amtliche Vermessung - Datenmodell MOpublic (OGD)');
    await expect(activeMapItemsList).toContainText('Amtliche Vermessung - Datenmodell ZH (Standard) (OGD)');

    await expect(remainingGeoDataItemsList).toBeVisible();
    await expect(remainingGeoDataItemsList).not.toContainText('Abflussprozesskarte (OGD)');
    await expect(remainingGeoDataItemsList).toContainText('AV Gewässer (OGD)');
    await expect(remainingGeoDataItemsList).toContainText('Basisplan 1:10000 farbig (OGD)');
    await expect(remainingGeoDataItemsList).toContainText('Basisplan 1:10000 schwarz/weiss (OGD)');
    await expect(remainingGeoDataItemsList).toContainText('Basisplan 1:2500 farbig (OGD)');
    await expect(remainingGeoDataItemsList).toContainText('Basisplan 1:2500 schwarz/weiss (OGD)');
    await expect(remainingGeoDataItemsList).toContainText('Basisplan 1:5000 farbig (OGD)');
    await expect(remainingGeoDataItemsList).toContainText('Basisplan 1:5000 schwarz/weiss (OGD)');

    const avDataModelCH = activeMapItemsList.getByText('Amtliche Vermessung - Datenmodell CH (OGD)');
    await avDataModelCH.click();

    const availableDataFormat = activeMapItemsList.locator('mat-option');
    await expect(availableDataFormat).toBeVisible();
    await expect(availableDataFormat).toContainText('INTERLIS1');
    await availableDataFormat.click();

    // Clickaway.
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);

    const downloadStartButton = dataDownloadDialog.locator('[data-test-id="data-download-download-button"]');
    await expect(downloadStartButton).toBeVisible();

    await downloadStartButton.click();

    const downloadConfirmDialog = page.locator('api-dialog-wrapper[title="Hinweis"]');
    await expect(downloadConfirmDialog).toBeVisible();

    const downloadConfirmButton = downloadConfirmDialog.getByText('Download');
    await expect(downloadConfirmButton).toBeVisible();
    await downloadConfirmButton.click();

    const downloadQueueTitle = page.locator('h2.data-download-status-queue__header__title');
    await expect(downloadQueueTitle).toBeVisible();
    await expect(downloadQueueTitle).toContainText('Download Warteschlange');

    const downloadButton = page.locator('a[title="Download: Amtliche Vermessung - Datenmodell CH (OGD)"]');
    await downloadButton.waitFor({timeout: 120_000});
    await expect(await downloadButton.getAttribute('href')).toContain('https://geoservices.zh.ch/geoshopapi/v1/orders/asdf1234/download');
  });

  describeA11y(() => {
    test('has no detectable accessibility violations while the data download dialogs are open', async ({
      useHar,
      openDataDownloadSelectionTools,
      openMunicipalityDownloadDialog,
      selectMunicipalityAndContinue,
      captureConsole,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      const dataDownloadSelectionTools = await openDataDownloadSelectionTools('2702555', '1241686', 'Amtliche Vermessung in Farbe');

      // First distinct state: the selection-tool step, before any area is chosen.
      await checkA11y();

      const municipalityDownloadDialog = await openMunicipalityDownloadDialog(dataDownloadSelectionTools);

      // Second distinct state: the municipality-picker dialog overlaying the map. It's a modal overlay on top of
      // the already-scanned page, so scope the scan to the dialog itself instead of re-scanning the page behind it.
      await checkA11y({include: ['api-dialog-wrapper[title="Daten beziehen"]']});

      await selectMunicipalityAndContinue(municipalityDownloadDialog, 'Volken');

      // Third distinct state: the final data-selection dialog listing available downloads. Same reasoning as
      // above: scope to the new dialog rather than re-scanning the unchanged page behind it.
      await checkA11y({include: ['data-download-dialog']});
    });
  });
});
