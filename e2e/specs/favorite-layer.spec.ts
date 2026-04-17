import {test, expect} from '../fixtures';

test.describe('Favorites layers', () => {
  test('adds and removes a favorite after logging in', async ({
    page,
    openUrlWithCoordinates,
    login,
    selectTopic,
    clickMapInTheList,
    useHar,
    captureConsole,
  }) => {
    captureConsole();
    await useHar();

    await openUrlWithCoordinates('2682260', '1248390');

    await login();

    await page.waitForLoadState('networkidle');

    const gisBrowser = page.locator('span', {hasText: 'GIS-Browser'}).last();
    await gisBrowser.scrollIntoViewIfNeeded();
    await gisBrowser.click();

    await page.waitForLoadState('networkidle');

    await selectTopic('Bauten');
    await clickMapInTheList('AWA-Standorte');

    // Add favorite
    const starIcon = page.locator('mat-icon[svgicon="ktzh_star"]');
    await starIcon.scrollIntoViewIfNeeded();
    await starIcon.click({force: true});

    const favoriteTitle = 'MyTestFavorite';

    const nameInput = page.locator('input#name');
    await nameInput.fill(favoriteTitle);

    const saveButton = page.locator('span', {hasText: 'Speichern'});
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click({force: true});

    await page.waitForLoadState('networkidle');

    // Wait until favorite appears in the list
    await selectTopic('Favoriten');
    const favoriteItem = page.locator('p', {hasText: favoriteTitle});
    await expect(favoriteItem).toBeVisible({timeout: 10000});

    // Delete favorite
    const deleteButton = favoriteItem.locator('//following-sibling::button');
    await deleteButton.click();
    const confirmDelete = page.locator('span', {hasText: 'Löschen'});
    await confirmDelete.click();

    // Assert deletion
    await selectTopic('Favoriten');
    await expect(page.locator('p', {hasText: favoriteTitle})).toHaveCount(0);
  });
});
