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
    test.slow();

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
    const favouriteButton = page.locator('active-map-items button:has(mat-icon[svgicon="ktzh_star"])');
    await favouriteButton.scrollIntoViewIfNeeded();
    // The button is only enabled once the authentication state and the active map items have been propagated.
    await expect(favouriteButton).toBeEnabled();
    await favouriteButton.click();

    const favoriteTitle = 'MyTestFavorite';

    const favouriteDialog = page.locator('favourite-creation-dialog');
    await expect(favouriteDialog).toBeVisible();

    const nameInput = favouriteDialog.locator('input#name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(favoriteTitle);

    const saveButton = favouriteDialog.getByRole('button', {name: 'Speichern'});
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(favouriteDialog).toBeHidden();
    await page.waitForLoadState('networkidle');

    // Wait until favorite appears in the list
    await selectTopic('Favoriten');
    const favoriteItem = page.locator('p', {hasText: favoriteTitle});
    await expect(favoriteItem).toBeVisible({timeout: 10000});

    // Delete favorite
    const deleteButton = favoriteItem.locator('//following-sibling::button');
    await deleteButton.click();
    const deletionDialog = page.locator('app-favourite-deletion-dialog');
    await expect(deletionDialog).toBeVisible();
    const confirmDelete = deletionDialog.getByRole('button', {name: 'Löschen'});
    await confirmDelete.click();
    await expect(deletionDialog).toBeHidden();

    // Assert deletion
    await selectTopic('Favoriten');
    await expect(page.locator('p', {hasText: favoriteTitle})).toHaveCount(0);
  });
});
