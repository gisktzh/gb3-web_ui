import {test, expect, describeA11y} from '../fixtures';

test.describe('OEREB-Kataster', () => {
  test('opens the OEREB-Kataster and searches for a specific address, returning its data in the info request', async ({
    page,
    openOerebInfoRequest,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await openOerebInfoRequest('Weststrasse 49, 8003');

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible({timeout: 30_000});
    await expect(page.locator('feature-info-content', {hasText: 'Markieren'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'BFSNr'}).locator('xpath=following-sibling::td')).toContainText('261');
    await expect(page.locator('th', {hasText: 'Nummer'}).locator('xpath=following-sibling::td')).toContainText('WD4055');
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH179170449958');
    await expect(page.locator('th', {hasText: 'Vollstaendigkeit'}).locator('xpath=following-sibling::td')).toContainText('Vollstaendig');
    await expect(page.locator('th', {hasText: 'Fläche'}).locator('xpath=following-sibling::td')).toContainText('544');
    await expect(page.locator('button', {hasText: 'Info drucken'})).toBeVisible();
  });

  describeA11y(() => {
    test('has no detectable accessibility violations while showing an info request result', async ({
      openOerebInfoRequest,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      await openOerebInfoRequest('Weststrasse 49, 8003');

      await checkA11y();
    });
  });
});
