import {test, expect, describeA11y} from '../fixtures';

test.describe('Onboarding guide tour', () => {
  test('shows the onboarding guide', async ({page, useHar, openUrlWithCoordinates, captureConsole}) => {
    test.setTimeout(60_000);

    async function assertStep(text: string, shouldGoBack: boolean = false, expectBackButton: boolean = true) {
      const title = page.locator('mat-card-title', {hasText: text});
      await expect(title).toBeVisible();
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
      await expect(title).toBeHidden();
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
    await expect(page.locator('button', {hasText: 'Beenden'})).toBeVisible({timeout: 30_000});
  });

  describeA11y(() => {
    test('has no detectable accessibility violations while showing the onboarding guide', async ({
      page,
      useHar,
      openUrlWithCoordinates,
      captureConsole,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      await openUrlWithCoordinates('2702555', '1241686', false);
      await expect(page.locator('mat-card-title', {hasText: 'Willkommen auf dem GIS-Browser des Kantons Zürich'})).toBeVisible();

      // The tour is rendered by ngx-ui-tour-md-menu inside a mat-menu panel (role="menu") containing a card; that's
      // third-party markup we can't remediate.
      await checkA11y({exclude: ['.mat-mdc-menu-panel']});
    });
  });
});
