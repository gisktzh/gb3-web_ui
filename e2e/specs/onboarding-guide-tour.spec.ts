import {test, expect} from '../fixtures';

test.describe('Onboarding guide tour', () => {
  test('shows the onboarding guide', async ({page, useHar, openUrlWithCoordinates, captureConsole}) => {
    async function assertStep(text: string, shouldGoBack: boolean = false, expectBackButton: boolean = true) {
      await expect(page.locator('mat-card-title', {hasText: text})).toBeVisible();
      const continueButton = page.locator('button', {hasText: 'Weiter'});
      await expect(continueButton).toBeVisible();
      const backButton = page.locator('button', {hasText: 'Zurück'});
      if (expectBackButton) {
        await expect(backButton).toBeVisible();
      }

      if (shouldGoBack && expectBackButton) {
        await backButton.click();
      } else {
        await continueButton.click();
      }

      // Animations etc.
      await page.waitForTimeout(200);
    }

    await useHar();
    captureConsole();

    await openUrlWithCoordinates('2702555', '1241686', false);

    await assertStep('Willkommen auf dem GIS-Browser des Kantons Zürich', false, false);
    await assertStep('Suche');
    await assertStep('Suchfilter');
    await assertStep('Kartenkatalog');
    await assertStep('Aktive Karten');
    await assertStep('Werkzeuge');
    await assertStep('Navigation');
    await assertStep('Hintergrund', true);
    await assertStep('Navigation');
    await assertStep('Hintergrund');
    await assertStep('Info-Klick');
    await expect(page.locator('button', {hasText: 'Beenden'})).toBeVisible();
  });
});
