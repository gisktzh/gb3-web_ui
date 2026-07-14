import {test, expect, ScreenCoordsList, ScreenCoords} from '../fixtures';

test.describe('Drawing', () => {
  test('draws different shapes and sizes and can edit them', async ({
    page,
    openUrlWithCoordinates,
    useHar,
    captureConsole,
    drawShapeOnMap,
    assertShapeEdit,
  }) => {
    await useHar();
    captureConsole();

    await openUrlWithCoordinates('300', '300');

    const mapContainer = page.locator('map-container');

    const drawingMenuOpenButton = page.locator('button[aria-label="Zeichnen"]');
    await expect(drawingMenuOpenButton).toBeVisible();
    await drawingMenuOpenButton.click();

    const drawingMenu = page.locator('drawing-tools');
    await expect(drawingMenu).toBeVisible();

    const settingsButton = drawingMenu.locator('button[aria-label="Einstellungen"]');
    const pointToolButton = drawingMenu.locator('button[aria-label="Punkt: In Karte klicken um zu wählen."]');
    const lineToolButton = drawingMenu.locator('button[aria-label="Linie: Mit Doppelklick beenden."]');
    const polygonToolButton = drawingMenu.locator('button[aria-label="Polygon: Auf Startpunkt klicken oder Doppelklick um zu beenden."]');
    const rectangleToolButton = drawingMenu.locator('button[aria-label="Rechteck: Diagonale Eckpunkte wählen."]');
    const circleToolButton = drawingMenu.locator('button[aria-label="Kreis: Mittelpunkt und Radius wählen."]');
    const textToolButton = drawingMenu.locator(
      'button[aria-label="Text: In Karte klicken um Position zu wählen, anschliessend Text eingeben."]',
    );
    const symbolToolButton = drawingMenu.locator('button[aria-label="Symbol: Auswählen und auf Karte hinzufügen"]');

    await expect(settingsButton).toBeVisible();
    await expect(pointToolButton).toBeVisible();
    await expect(lineToolButton).toBeVisible();
    await expect(polygonToolButton).toBeVisible();
    await expect(rectangleToolButton).toBeVisible();
    await expect(circleToolButton).toBeVisible();
    await expect(textToolButton).toBeVisible();
    await expect(symbolToolButton).toBeVisible();

    const symbolCategories = [
      'Zivile Signaturen',
      'Tiere',
      'Pfeile',
      'Gebäude',
      'Öffentliche Hand',
      'Landschaften 1',
      'Landschaften 2',
      'Nationalpark/Naturpark',
      'Orte von Interesse',
      'Öffentliche Sicherheit',
      'Bäume',
      'UN OCHA',
    ];

    // Setup:
    // Define some coordinates, so they're not simply magic numbers. Since the screen is set to be
    // 1920x1080, minus side bars, header, etc., we have roughly 500,150 to 1700,950 as available coordinate space.
    // After each drawing, we check for the visibility of the map container. If it's still there, there's
    // no non-recoverable error.

    const pointCoords: ScreenCoords = [850, 600];
    const lineCoords: ScreenCoordsList = [
      [700, 200],
      [900, 300],
      [600, 400],
    ];
    const polygonCoords: ScreenCoordsList = [
      [1000, 900],
      [800, 900],
      [700, 700],
      [650, 750],
    ];
    const reactangleCoords: ScreenCoordsList = [
      [500, 500],
      [750, 650],
    ];
    const circleCoords: ScreenCoordsList = [
      [1200, 500],
      [1200, 700],
    ];
    const textCoords: ScreenCoords = [900, 950];
    const symbolCoords: ScreenCoords = [600, 900];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

    // Point add
    await pointToolButton.click();
    await page.waitForTimeout(250);
    await page.mouse.click(pointCoords[0], pointCoords[1]);
    await page.waitForTimeout(100);

    await expect(mapContainer).toBeVisible();

    // Line add
    await lineToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(lineCoords);
    await page.waitForTimeout(100);

    await expect(mapContainer).toBeVisible();

    // Polygon add
    await polygonToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(polygonCoords);
    await page.waitForTimeout(100);

    await expect(mapContainer).toBeVisible();

    // Rectangle add
    await rectangleToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(reactangleCoords);
    await page.waitForTimeout(100);

    await expect(mapContainer).toBeVisible();

    // Circle add
    await circleToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(circleCoords);
    await page.waitForTimeout(100);

    await expect(mapContainer).toBeVisible();

    // Text add
    await textToolButton.click();
    await page.waitForTimeout(250);
    await page.mouse.click(textCoords[0], textCoords[1]);
    await page.waitForTimeout(500);

    const textDrawingToolInputForm = page.locator('text-drawing-tool-input');
    await expect(textDrawingToolInputForm).toBeVisible();
    const textDrawingToolFormInput = textDrawingToolInputForm.locator('input');
    await expect(textDrawingToolFormInput).toBeVisible();

    await textDrawingToolFormInput.focus();
    await textDrawingToolFormInput.clear();
    await textDrawingToolFormInput.fill('Hello, World!');

    const textDrawingToolFormSubmit = textDrawingToolInputForm.getByRole('button', {name: 'Hinzufügen'});
    await expect(textDrawingToolFormSubmit).toBeVisible();
    await textDrawingToolFormSubmit.click();
    await page.waitForTimeout(100);

    await expect(mapContainer).toBeVisible();

    // Symbol add
    await symbolToolButton.click();
    await page.waitForTimeout(250);
    const symbolInput = page.locator('symbol-drawing-tool-input');
    await expect(symbolInput).toBeVisible();

    // Close it and reopen it
    const closeButton = page.locator('mat-dialog-container button', {hasText: 'close'});
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await page.waitForTimeout(250);
    await expect(symbolInput).not.toBeVisible();

    await symbolToolButton.click();
    await page.waitForTimeout(250);
    await expect(symbolInput).toBeVisible();

    const symbolSliderInputs = await symbolInput.locator('slider-edit').all();
    await symbolSliderInputs[0].locator('input').fill('16');
    await page.waitForTimeout(250);
    await expect(symbolSliderInputs[0].locator('.slider-wrapper__header__value')).toContainText('16');

    await symbolSliderInputs[1].locator('input').fill('180');
    await page.waitForTimeout(250);
    await expect(symbolSliderInputs[1].locator('.slider-wrapper__header__value')).toContainText('180');

    const categories = await symbolInput.locator('mat-expansion-panel-header').all();
    for (const [index, title] of symbolCategories.entries()) {
      await expect(categories[index]).toContainText(title);
    }

    await categories[1].click();
    await page.waitForTimeout(250);
    const porcupine = symbolInput.locator('label[for="Porcupine"]');
    await expect(porcupine).toBeVisible();
    await porcupine.click();

    const addButton = symbolInput.locator('button', {hasText: 'Hinzufügen'});
    await expect(addButton).toBeVisible();
    await addButton.click();
    await page.waitForTimeout(1000);

    await page.mouse.click(symbolCoords[0], symbolCoords[1]);
    await page.waitForTimeout(1000);

    // Scroll in and out once to make all drawings visible by refreshing the @arcgis/core map rendering.
    await page.mouse.wheel(0, 10);
    await page.mouse.wheel(0, -10);

    await expect(mapContainer).toBeVisible();

    await page.waitForTimeout(250);

    // Point edit
    await assertShapeEdit('point-edit', pointCoords, ['8', '0.6', '0.3', '20'], ['#00ff00', '#00ff00']);

    // Line edit
    await assertShapeEdit('line-edit', lineCoords[0], ['8', '0.6'], ['#00ff00']);

    // Polygon edit
    await assertShapeEdit('polygon-edit', polygonCoords[0], ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);

    // Rectangle edit
    await assertShapeEdit('polygon-edit', reactangleCoords[0], ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);

    // Circle edit
    await assertShapeEdit('polygon-edit', circleCoords[0], ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);

    // Text edit - adjust the coords a bit so the cursor actually clicks on the text.
    await assertShapeEdit('text-edit', [textCoords[0], textCoords[1] - 10], ['12', '8', '13'], ['#00ff00', '#00ff00'], ['Changed']);

    // Symbol edit
    await assertShapeEdit('symbol-edit', symbolCoords, ['20', '60'], [], [], 'Hippo');
  });
});
