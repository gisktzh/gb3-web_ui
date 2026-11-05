import {test, expect, describeA11y} from '../fixtures';

test.describe('Apps page', () => {
  test('shows the list of available external applications', async ({page, useHar, captureConsole, openAppsPage}) => {
    await useHar();
    captureConsole();

    await openAppsPage();

    await expect(page.locator('a', {hasText: 'Verkehr Online'})).toBeVisible();
  });

  describeA11y(() => {
    test('has no detectable accessibility violations', async ({page, useHar, captureConsole, openAppsPage}) => {
      await useHar();
      captureConsole();

      await openAppsPage();

      await expect(page).toNotHaveAccessibilityViolations();
    });
  });
});
