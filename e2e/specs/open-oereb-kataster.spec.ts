import {test, expect} from '../fixtures';
import type {TopicsStatisticInfoListData} from '../../src/app/shared/models/gb3-api-generated.interfaces';

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
    await page.route('**/topics/StatBeschaeftigteZH/statistic_info?**', (route) => {
      const url = new URL(route.request().url());
      return route.fulfill({
        json: {
          statistic_info: {
            topic: 'StatBeschaeftigteZH',
            topic_title: 'Beschäftigtenstatistik im ausgewählten Gebiet',
            geolion_karten_uuid: null,
            layer: 'stat-ent-p',
            layer_title: 'Beschäftigte',
            geolion_geodatensatz_uuid: null,
            fields: ['anz_besch', 'anz_vzae', 'anz_ast'],
            statistic: 'sum',
            geometry: url.searchParams.get('geometry')!,
            srid: Number(url.searchParams.get('srid')),
            feature_geometry: null,
            results: {
              anz_besch: {alias: 'Anzahl Beschäftigte', value: 42, count: 3},
              anz_vzae: {alias: 'Vollzeitäquivalente', value: 35.5, count: 3},
              anz_ast: {alias: 'Arbeitsstätten', value: 3, count: 3},
            },
          },
        } satisfies TopicsStatisticInfoListData,
      });
    });
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
    await expect(bottomSheet.getByText('Anzahl Beschäftigte', {exact: true})).toBeVisible();
    await expect(bottomSheet.getByText('Summe', {exact: true})).toBeVisible();

    await featuresTab.click();

    await expect(featuresTab).toHaveAttribute('aria-selected', 'true');
    await expect(statisticsTab).toHaveAttribute('aria-selected', 'false');
    await expect(bottomSheet.locator('feature-info')).toBeVisible();
  });
});
