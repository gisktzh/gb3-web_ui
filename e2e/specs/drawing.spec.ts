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

function isScreenCoordsList(coords: ScreenCoords | ScreenCoordsList): coords is ScreenCoordsList {
  return Array.isArray(coords[0]);
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
  clickCoords: ScreenCoords | ScreenCoordsList,
  sliderInputValues: string[] = [],
  colorInputValues: string[] = [],
  textInputValues: string[] = [],
  radioInputId: string = '',
) {
  const mapContainer = page.locator('map-container');
  const editTool = page.locator(editToolSelector);
  const clickCoordinateList: ScreenCoordsList = isScreenCoordsList(clickCoords) ? clickCoords : [clickCoords];

  // Retrying the right click makes the test resilient against transient map-tool timing and hit-test sensitivity.
  const clickOffsets: ScreenCoordsList = [
    [0, 0],
    [8, 0],
    [0, 8],
    [-8, 0],
    [0, -8],
  ];
  for (const [x, y] of clickCoordinateList) {
    for (const [offsetX, offsetY] of clickOffsets) {
      await page.mouse.click(x + offsetX, y + offsetY, {button: 'right'});
      await page.waitForTimeout(350);
      if (await editTool.isVisible()) {
        break;
      }
    }
    if (await editTool.isVisible()) {
      break;
    }
  }
  await expect(editTool).toBeVisible({timeout: 30_000});

  if (sliderInputValues.length > 0) {
    // Use live locators instead of an `all()` snapshot: editing a value redraws the graphic, which re-renders the
    // overlay and detaches previously resolved element handles.
    const sliderEdits = editTool.locator('slider-edit');
    await expect(sliderEdits).toHaveCount(sliderInputValues.length);

    for (const [index, value] of sliderInputValues.entries()) {
      const sliderEdit = sliderEdits.nth(index);
      await sliderEdit.locator('input').fill(value);
      // Wait for the value to be applied before touching the next slider, so the overlay is settled again.
      await expect(sliderEdit.locator('.slider-wrapper__header__value')).toContainText(value);
    }
  }

  if (colorInputValues.length > 0) {
    const colorInputs = editTool.locator('input[type="color"]');
    await expect(colorInputs).toHaveCount(colorInputValues.length);

    for (const [index, value] of colorInputValues.entries()) {
      const colorInput = colorInputs.nth(index);
      await colorInput.fill(value);
      await expect(colorInput).toHaveValue(value);
      await expect(mapContainer).toBeVisible();
    }
  }

  if (textInputValues.length > 0) {
    const textInputs = editTool.locator('input:not([type])');
    await expect(textInputs).toHaveCount(textInputValues.length);

    for (const [index, value] of textInputValues.entries()) {
      const textInput = textInputs.nth(index);
      await textInput.fill(value);
      await expect(textInput).toHaveValue(value);
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

    await assertShapeEdit(page, 'line-edit', lineCoords, ['8', '0.6'], ['#00ff00']);
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

    await assertShapeEdit(page, 'polygon-edit', polygonCoords, ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);
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

    await assertShapeEdit(page, 'polygon-edit', reactangleCoords, ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);
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

    await assertShapeEdit(page, 'polygon-edit', circleCoords, ['8', '0.6', '0.7'], ['#00ff00', '#00ff00']);
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

    const textDrawingToolInputForm = page.locator('text-drawing-tool-input');

    // Retrying the click makes the test resilient against the first map click after activating a tool getting swallowed.
    for (let clickAttempt = 0; clickAttempt < 3; clickAttempt++) {
      await page.mouse.move(textCoords[0], textCoords[1]);
      await page.waitForTimeout(250);
      await page.mouse.click(textCoords[0], textCoords[1]);
      await page.waitForTimeout(1000);

      if (await textDrawingToolInputForm.isVisible()) {
        break;
      }
    }

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

    const symbolSliderInputs = symbolInput.locator('slider-edit');
    await expect(symbolSliderInputs).toHaveCount(2);

    await symbolSliderInputs.nth(0).locator('input').fill('16');
    await expect(symbolSliderInputs.nth(0).locator('.slider-wrapper__header__value')).toContainText('16');

    await symbolSliderInputs.nth(1).locator('input').fill('180');
    await expect(symbolSliderInputs.nth(1).locator('.slider-wrapper__header__value')).toContainText('180');

    const categories = symbolInput.locator('mat-expansion-panel-header');
    await expect(categories).toHaveCount(symbolCategories.length);
    for (const [index, title] of symbolCategories.entries()) {
      await expect(categories.nth(index)).toContainText(title);
    }

    await categories.nth(1).click();
    const porcupine = symbolInput.locator('label[for="Porcupine"]');
    await expect(porcupine).toBeVisible();
    await porcupine.click();

    const addButton = symbolInput.locator('button', {hasText: 'Hinzufügen'});
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect(symbolInput).not.toBeVisible();
    await page.waitForLoadState('networkidle');

    // Matching the active class as part of the locator makes "not found" and "not active" equivalent, so the checks
    // below never blow up when the drawing tool menu is re-rendered.
    const activeSymbolToolButton = drawingMenu.locator(
      'button[aria-label="Symbol: Auswählen und auf Karte hinzufügen"].drawing-tools__button--active',
    );

    // The strategy only arms the sketch after asynchronously fetching the symbol descriptor, so this can take a while.
    await expect(activeSymbolToolButton).toBeVisible({timeout: 30_000});

    // Retrying the click makes the test resilient against the first map click after arming the tool getting swallowed.
    for (let clickAttempt = 0; clickAttempt < 3; clickAttempt++) {
      await page.mouse.move(symbolCoords[0], symbolCoords[1]);
      await page.waitForTimeout(250);
      await page.mouse.click(symbolCoords[0], symbolCoords[1]);
      await page.waitForTimeout(500);

      if ((await activeSymbolToolButton.count()) === 0) {
        break;
      }
    }

    // Placing the symbol deactivates the tool again.
    await expect(activeSymbolToolButton).toHaveCount(0, {timeout: 30_000});

    await expect(mapContainer).toBeVisible();

    await assertShapeEdit(page, 'symbol-edit', symbolCoords, ['20', '60'], [], [], 'Hedgehog');
  });
});
