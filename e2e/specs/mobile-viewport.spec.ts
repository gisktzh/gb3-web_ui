import {test, expect, describeA11y} from '../fixtures';
import {getMapPoint, waitForMap} from '../utils/map.utils';

// Phone-sized viewport so the mobile layout (mobile navbar, map management, bottom sheet) is rendered instead of the desktop one.
test.use({viewport: {width: 390, height: 844}, hasTouch: true});

describeA11y(() => {
  test.describe('Mobile viewport', () => {
    test('has no detectable accessibility violations on the mobile map page', async ({
      openUrlWithCoordinates,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar('map-page');
      captureConsole();

      await openUrlWithCoordinates('2702555', '1241686');

      await checkA11y();
    });

    test('has no detectable accessibility violations with the mobile navigation menu open', async ({
      page,
      openUrlWithCoordinates,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar('navigation-menu');
      captureConsole();

      await openUrlWithCoordinates('2702555', '1241686');
      await page.locator('navbar-mobile button').click();
      await expect(page.locator('mat-dialog-container')).toBeVisible();

      await checkA11y();
    });

    test('has no detectable accessibility violations in the mobile map management', async ({
      page,
      openUrlWithCoordinates,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar('map-management');
      captureConsole();

      await openUrlWithCoordinates('2702555', '1241686');
      await page.getByTestId('map-management-open').tap();
      await expect(page.getByTestId('map-management-tab-active')).toBeVisible();
      await checkA11y();

      await page.getByRole('button', {name: 'Kartenkatalog'}).tap();
      await expect(page.locator('map-data-catalogue')).toBeVisible();
      await checkA11y();
    });

    test('has no detectable accessibility violations in the mobile share dialog', async ({
      page,
      openUrlWithCoordinates,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar('share-dialog');
      captureConsole();

      await openUrlWithCoordinates('2702555', '1241686');
      await page.getByTestId('map-share').tap();
      // The input is only enabled once the share link has been created.
      await expect(page.locator('share-link-mobile input')).toBeEnabled();

      await checkA11y();
    });

    test('has no detectable accessibility violations while showing an info request in the bottom sheet', async ({
      page,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar('info-request');
      captureConsole();

      await page.goto('/maps?initialMapIds=AVfarbigZH&x=2702555&y=1241686&scale=251');
      await waitForMap(page);
      // The map notice of the layer overlays the map and would swallow the tap.
      const closeNoticesButton = page.getByTestId('close-map-notices-button');
      await closeNoticesButton.waitFor({state: 'visible', timeout: 10_000}).catch(() => undefined);
      if (await closeNoticesButton.isVisible()) {
        await closeNoticesButton.tap();
        await expect(closeNoticesButton).toBeHidden();
      }
      await page.waitForLoadState('networkidle');
      const point = await getMapPoint(page);
      // Taps issued while the map is still settling are ignored, so retry until the bottom sheet shows up.
      await expect(async () => {
        await page.touchscreen.tap(point.position.x, point.position.y);
        await expect(page.getByTestId('bottom-sheet-title')).toHaveText('Info', {timeout: 3_000});
      }).toPass({timeout: 30_000});

      await checkA11y();
    });
  });
});
