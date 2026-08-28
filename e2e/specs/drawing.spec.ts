import {Page} from '@playwright/test';
import {test, expect, ScreenCoordsList, ScreenCoords} from '../fixtures';

async function openMapAndDrawingTools(
  page: Page,
  openUrlWithCoordinates: (x: string, y: string, shouldSkipTour?: boolean | undefined) => Promise<void>,
) {
  await openUrlWithCoordinates('2702555', '1241686');
  await page.waitForLoadState('networkidle');

  const mapContainer = page.locator('map-container');
  await expect(mapContainer).toBeVisible();

  const drawingMenuOpenButton = page.locator('button[aria-label="Zeichnen"]');
  await expect(drawingMenuOpenButton).toBeVisible();
  await drawingMenuOpenButton.click();

  const drawingMenu = page.locator('drawing-tools');
  await expect(drawingMenu).toBeVisible();
}

async function drawShapeOnMap(page: Page, coordList: ScreenCoordsList) {
  for (const [index, coords] of coordList.entries()) {
    if (index === coordList.length - 1) {
      // Double click at the end of the shape.
      await page.mouse.dblclick(coords[0], coords[1]);
    } else {
      await page.mouse.click(coords[0], coords[1]);
    }
    await page.waitForTimeout(250);
  }
}

async function assertShapeEdit(
  page: Page,
  editToolSelector: string,
  clickCoords: ScreenCoords,
  sliderInputValues: string[] = [],
  colorInputValues: string[] = [],
  textInputValues: string[] = [],
  radioInputId: string = '',
) {
  const mapContainer = page.locator('map-container');

  await page.mouse.click(clickCoords[0], clickCoords[1], {
    button: 'right',
  });
  await page.waitForTimeout(500);
  const editTool = page.locator(editToolSelector);
  await expect(editTool).toBeVisible({timeout: 30_000});

  if (sliderInputValues.length > 0) {
    const sliderInputs = await editTool.locator('slider-edit').all();
    for (const [index, value] of sliderInputValues.entries()) {
      const inputField = sliderInputs[index].locator('input');
      await inputField.fill(value);
    }
  }

  if (colorInputValues.length > 0) {
    const colorInputs = await editTool.locator('input[type="color"]').all();
    for (const [index, value] of colorInputValues.entries()) {
      await colorInputs[index].fill(value);
      await expect(mapContainer).toBeVisible();
    }
  }

  if (textInputValues.length > 0) {
    const textInputs = await editTool.locator('input:not([type])').all();
    for (const [index, value] of textInputValues.entries()) {
      await textInputs[index].focus();
      await textInputs[index].clear();
      await textInputs[index].fill(value);
      await expect(mapContainer).toBeVisible();
    }
  }

  if (radioInputId.length > 0) {
    const radioInput = editTool.locator(`label[for="${radioInputId}"]`);
    await expect(radioInput).toBeVisible();
    await radioInput.click({force: true});
    await page.waitForTimeout(500);
    await expect(mapContainer).toBeVisible();
  }

  const closeButton = page.locator('drawing-edit-overlay button', {hasText: 'close'});
  await closeButton.click();
  await page.waitForTimeout(500); // Wait for the edit tool to be closed.
}

test.describe('Drawing', () => {
  test('draws a point and can edit it', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.slow();

    await useHar('point');
    captureConsole();

    await openMapAndDrawingTools(page, openUrlWithCoordinates);

    const mapContainer = page.locator('map-container');
    const drawingMenu = page.locator('drawing-tools');

    const pointToolButton = drawingMenu.locator('button[aria-label="Punkt: In Karte klicken um zu wählen."]');
    await expect(pointToolButton).toBeVisible();

    const pointCoords: ScreenCoords = [850, 600];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

    await pointToolButton.click();
    await page.waitForTimeout(500);
    await page.mouse.click(pointCoords[0], pointCoords[1]);
    await page.waitForTimeout(500);

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'point-edit', pointCoords, ['8', '0.6', '0.3', '20'], ['#00ff00', '#00ff00']);
  });

  test('draws a line and can edit it', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.slow();

    await useHar('line');
    captureConsole();

    await openMapAndDrawingTools(page, openUrlWithCoordinates);

    const mapContainer = page.locator('map-container');
    const drawingMenu = page.locator('drawing-tools');

    const lineToolButton = drawingMenu.locator('button[aria-label="Linie: Mit Doppelklick beenden."]');
    await expect(lineToolButton).toBeVisible();

    const lineCoords: ScreenCoordsList = [
      [700, 200],
      [900, 300],
      [600, 400],
    ];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

    await lineToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(page, lineCoords);
    await page.waitForTimeout(250);

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'line-edit', lineCoords[0], ['8', '0.6'], ['#00ff00']);
  });

  test('draws a polygon and can edit it', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.slow();

    await useHar('polygon');
    captureConsole();

    await openMapAndDrawingTools(page, openUrlWithCoordinates);

    const mapContainer = page.locator('map-container');
    const drawingMenu = page.locator('drawing-tools');

    const polygonToolButton = drawingMenu.locator('button[aria-label="Polygon: Auf Startpunkt klicken oder Doppelklick um zu beenden."]');
    await expect(polygonToolButton).toBeVisible();

    const polygonCoords: ScreenCoordsList = [
      [1000, 900],
      [800, 900],
      [700, 700],
      [650, 750],
    ];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

    await polygonToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(page, polygonCoords);
    await page.waitForTimeout(250);

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'polygon-edit', polygonCoords[0], ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);
  });

  test('draws a rectangle and can edit it', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.slow();

    await useHar('rectangle');
    captureConsole();

    await openMapAndDrawingTools(page, openUrlWithCoordinates);

    const mapContainer = page.locator('map-container');
    const drawingMenu = page.locator('drawing-tools');

    const rectangleToolButton = drawingMenu.locator('button[aria-label="Rechteck: Diagonale Eckpunkte wählen."]');
    await expect(rectangleToolButton).toBeVisible();

    const reactangleCoords: ScreenCoordsList = [
      [500, 500],
      [750, 650],
    ];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

    await rectangleToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(page, reactangleCoords);
    await page.waitForTimeout(250);

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'polygon-edit', reactangleCoords[0], ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);
  });

  test('draws a circle and can edit it', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.slow();

    await useHar('circle');
    captureConsole();

    await openMapAndDrawingTools(page, openUrlWithCoordinates);

    const mapContainer = page.locator('map-container');
    const drawingMenu = page.locator('drawing-tools');

    const circleToolButton = drawingMenu.locator('button[aria-label="Kreis: Mittelpunkt und Radius wählen."]');
    await expect(circleToolButton).toBeVisible();

    const circleCoords: ScreenCoordsList = [
      [1200, 500],
      [1200, 700],
    ];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

    await circleToolButton.click();
    await page.waitForTimeout(250);
    await drawShapeOnMap(page, circleCoords);
    await page.waitForTimeout(250);

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'polygon-edit', circleCoords[0], ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);
  });

  test('draws text and can edit it', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.slow();

    await useHar('text');
    captureConsole();

    await openMapAndDrawingTools(page, openUrlWithCoordinates);

    const mapContainer = page.locator('map-container');
    const drawingMenu = page.locator('drawing-tools');

    const textToolButton = drawingMenu.locator(
      'button[aria-label="Text: In Karte klicken um Position zu wählen, anschliessend Text eingeben."]',
    );
    await expect(textToolButton).toBeVisible();

    const textCoords: ScreenCoords = [900, 950];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

    await textToolButton.click();
    await page.waitForTimeout(250);
    await page.mouse.click(textCoords[0], textCoords[1]);

    const textDrawingToolInputForm = page.locator('text-drawing-tool-input');
    await expect(textDrawingToolInputForm).toBeVisible({timeout: 30_000});
    const textDrawingToolFormInput = textDrawingToolInputForm.locator('input');
    await expect(textDrawingToolFormInput).toBeVisible();

    await textDrawingToolFormInput.focus();
    await textDrawingToolFormInput.clear();
    await textDrawingToolFormInput.fill('Hello, World!');

    const textDrawingToolFormSubmit = textDrawingToolInputForm.getByRole('button', {name: 'Hinzufügen'});
    await expect(textDrawingToolFormSubmit).toBeVisible();
    await textDrawingToolFormSubmit.click();

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'text-edit', [textCoords[0], textCoords[1] - 10], ['12', '8', '13'], ['#00ff00', '#00ff00'], ['Changed']);
  });

  test('draws a symbol and can edit it', async ({page, openUrlWithCoordinates, useHar, captureConsole}) => {
    test.slow();

    await useHar('symbol');
    captureConsole();

    await openMapAndDrawingTools(page, openUrlWithCoordinates);

    const mapContainer = page.locator('map-container');
    const drawingMenu = page.locator('drawing-tools');

    const settingsButton = drawingMenu.locator('button[aria-label="Einstellungen"]');
    const symbolToolButton = drawingMenu.locator('button[aria-label="Symbol: Auswählen und auf Karte hinzufügen"]');
    await expect(settingsButton).toBeVisible();
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

    const symbolCoords: ScreenCoords = [600, 900];

    // Cursor move, so the tooltip overlay doesn't prevent us from clicking.
    await page.mouse.move(100, 100);

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
    await expect(symbolInput).not.toBeVisible();

    await symbolToolButton.click();
    await expect(symbolInput).toBeVisible();

    const symbolSliderInputs = await symbolInput.locator('slider-edit').all();
    await symbolSliderInputs[0].locator('input').fill('16');
    await expect(symbolSliderInputs[0].locator('.slider-wrapper__header__value')).toContainText('16');

    await symbolSliderInputs[1].locator('input').fill('180');
    await expect(symbolSliderInputs[1].locator('.slider-wrapper__header__value')).toContainText('180');

    const categories = await symbolInput.locator('mat-expansion-panel-header').all();
    for (const [index, title] of symbolCategories.entries()) {
      await expect(categories[index]).toContainText(title);
    }

    await categories[1].click();
    const porcupine = symbolInput.locator('label[for="Porcupine"]');
    await expect(porcupine).toBeVisible();
    await porcupine.click();

    const addButton = symbolInput.locator('button', {hasText: 'Hinzufügen'});
    await expect(addButton).toBeVisible();
    await addButton.click();

    await page.waitForTimeout(250);
    await page.mouse.move(symbolCoords[0], symbolCoords[1]);
    await page.waitForTimeout(250);
    await page.mouse.click(symbolCoords[0], symbolCoords[1]);
    await page.waitForTimeout(250);

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'symbol-edit', symbolCoords, ['20', '60'], [], [], 'Hedgehog');
  });
});
