import {test, expect} from '../fixtures';

test.describe('Data download', () => {
  test('downloads specified data', async ({page, useHar, openUrlWithCoordinates, filterForLayer, clickMapInTheList, captureConsole}) => {
    test.setTimeout(120_000);

    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);

    await filterForLayer('Amtliche Vermessung in Farbe');
    await clickMapInTheList('Amtliche Vermessung in Farbe');

    const dataDownloadDialogButton = page.locator('[data-test-id="map-data-download"]');
    await expect(dataDownloadDialogButton).toBeVisible();

    await dataDownloadDialogButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const dataDownloadSelectionTools = page.locator('data-download-selection-tools');
    await expect(dataDownloadSelectionTools).toBeVisible();

    const municipalityDownloadButton = dataDownloadSelectionTools.locator('[aria-label="Selektion: Auswahl einer Zürcher Gemeinde."]');
    await expect(municipalityDownloadButton).toBeVisible();
    await municipalityDownloadButton.click();

    const municipalityDownloadDialog = page.locator('api-dialog-wrapper[title="Daten beziehen"]');
    await expect(municipalityDownloadDialog).toBeVisible();

    const municipalityInput = municipalityDownloadDialog.locator('[aria-label="Gemeinde"]');
    await municipalityInput.focus();
    await municipalityInput.clear();
    await municipalityInput.fill('Volken');

    const selectedableOption = municipalityDownloadDialog.locator('mat-option');
    await expect(selectedableOption).toContainText('Volken');
    await selectedableOption.click();

    const continueButton = municipalityDownloadDialog.locator('[data-test-id="data-download-municipality-submit"]');
    await expect(continueButton).toBeVisible();
    await continueButton.click();

    await page.waitForTimeout(200);

    await expect(municipalityDownloadDialog).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    const dataDownloadDialog = page.locator('data-download-dialog');
    await expect(dataDownloadDialog).toBeVisible();

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

    await page.waitForTimeout(200);

    const downloadStartButton = dataDownloadDialog.locator('[data-test-id="data-download-download-button"]');
    await expect(downloadStartButton).toBeVisible();

    // Clicking twice to get rid of the overlay that the download format dropdown produces.
    await downloadStartButton.click({force: true});
    await page.waitForTimeout(50);
    await downloadStartButton.click({force: true});

    await page.waitForTimeout(200);

    const downloadConfirmDialog = page.locator('api-dialog-wrapper[title="Hinweis"]');
    await expect(downloadConfirmDialog).toBeVisible();

    const downloadConfirmButton = downloadConfirmDialog.getByText('Download');
    await expect(downloadConfirmButton).toBeVisible();
    await downloadConfirmButton.click();

    await page.waitForTimeout(500);

    const downloadQueueTitle = page.locator('h2.data-download-status-queue__header__title');
    await expect(downloadQueueTitle).toBeVisible();
    await expect(downloadQueueTitle).toContainText('Download Warteschlange');

    const downloadButton = page.locator('a[title="Download: Amtliche Vermessung - Datenmodell CH (OGD)"]');
    await downloadButton.waitFor({timeout: 120_000});
    await expect(await downloadButton.getAttribute('href')).toContain('https://geoservices.zh.ch/geoshopapi/v1/orders/asdf1234/download');
  });
});
