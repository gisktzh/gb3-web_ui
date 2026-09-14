import {test, expect} from '../fixtures';

test.describe('OEREB-Kataster', () => {
  test('opens the OEREB-Kataster and searches for a specific address, returning its data in the info request', async ({
    page,
    search,
    useHar,
    captureConsole,
  }) => {
    await useHar();
    captureConsole();

    await page.goto('/maps?initialMapIds=OerebKatasterZH');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    await search('Weststrasse 49, 8003');
    await page.waitForTimeout(5000); // Until the zoom is done

    const map = page.locator('map-page');
    await expect(map).toBeVisible();

    await map.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3', {hasText: 'Info'})).toBeVisible();
    await expect(page.locator('feature-info-content', {hasText: 'Markieren'})).toBeVisible();
    await expect(page.locator('th', {hasText: 'BFSNr'}).locator('xpath=following-sibling::td')).toContainText('261');
    await expect(page.locator('th', {hasText: 'Nummer'}).locator('xpath=following-sibling::td')).toContainText('WD4055');
    await expect(page.locator('th', {hasText: 'EGRIS_EGRID'}).locator('xpath=following-sibling::td')).toContainText('CH179170449958');
    await expect(page.locator('th', {hasText: 'Vollstaendigkeit'}).locator('xpath=following-sibling::td')).toContainText('Vollstaendig');
    await expect(page.locator('th', {hasText: 'Fläche'}).locator('xpath=following-sibling::td')).toContainText('544');
    await expect(page.locator('button', {hasText: 'Info drucken'})).toBeVisible();
  });

  test('switches between feature and statistics results in the mobile info bottom sheet', async ({page, useHar, captureConsole}) => {
    await page.setViewportSize({width: 390, height: 844});
    await useHar();
    captureConsole();

    await page.goto('/maps?initialMapIds=OerebKatasterZH');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    const searchTerm = 'Weststrasse 49, 8003';
    const searchInput = page.locator('search-bar input[placeholder="Suchen nach Adressen, Orten, Karten und mehr..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(searchTerm);
    await searchInput.dispatchEvent('keyup', {key: searchTerm.at(-1)});
    await page.waitForTimeout(200);
    await page.waitForLoadState('networkidle');

    const searchResult = page.locator('search-window-mobile button', {hasText: searchTerm});
    await expect(searchResult).toBeVisible();
    await searchResult.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Until the zoom is done

    const map = page.locator('map-container');
    await expect(map).toBeVisible();

    await map.click();
    await page.waitForLoadState('networkidle');

    const bottomSheet = page.locator('bottom-sheet-overlay');
    const featuresTab = bottomSheet.getByRole('tab', {name: 'Features'});
    const statisticsTab = bottomSheet.getByRole('tab', {name: 'Statistik'});

    await expect(featuresTab).toBeVisible();
    await expect(statisticsTab).toBeVisible();
    await expect(featuresTab).toHaveAttribute('aria-selected', 'true');
    await expect(bottomSheet.locator('feature-info')).toBeVisible();

    await statisticsTab.click();

    await expect(statisticsTab).toHaveAttribute('aria-selected', 'true');
    await expect(featuresTab).toHaveAttribute('aria-selected', 'false');
    await expect(bottomSheet.locator('statistics')).toBeVisible();
    await expect(bottomSheet.getByText('Beschäftigtenstatistik im ausgewählten Gebiet')).toBeVisible();

    await featuresTab.click();

    await expect(featuresTab).toHaveAttribute('aria-selected', 'true');
    await expect(statisticsTab).toHaveAttribute('aria-selected', 'false');
    await expect(bottomSheet.locator('feature-info')).toBeVisible();
  });
});
