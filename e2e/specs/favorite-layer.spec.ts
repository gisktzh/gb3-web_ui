import {test, expect} from '../fixtures';

test.describe('Favorites layers', () => {
  test('adds, restores, and removes a favorite after logging in', async ({
    page,
    openUrlWithCoordinates,
    login,
    selectTopic,
    clickMapInTheList,
    zoom,
    useHar,
    captureConsole,
  }) => {
    test.slow();

    captureConsole();
    await useHar();

    await openUrlWithCoordinates('2682260', '1248390');

    await login();

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

    const nameInput = favouriteDialog.locator('[data-test-id="input-favourite-title"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(favoriteTitle);

    const storeCenterCheckbox = favouriteDialog.locator('[data-test-id="input-favourite-store-center"] input');
    const storeScaleCheckbox = favouriteDialog.locator('[data-test-id="input-favourite-store-scale"] input');
    await expect(storeCenterCheckbox).toBeChecked();
    await expect(storeScaleCheckbox).toBeChecked();

    const saveButton = favouriteDialog.locator('[data-test-id="submit-create-favourite"]');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(favouriteDialog).toBeHidden();
    await page.waitForLoadState('networkidle');

    // Wait until favorite appears in the list
    await selectTopic('Favoriten');
    const favoriteItem = page.locator('p', {hasText: favoriteTitle});
    await expect(favoriteItem).toBeVisible({timeout: 10000});

    // Move away from the stored extent, then restore it by adding the favorite.
    const zoomInput = page.locator('[data-test-id="input-map-scale"]');
    const coordsInput = page.locator('[data-test-id="input-map-coordinates"]');
    await zoom(1000);
    await coordsInput.fill('2683000 / 1249000');
    await expect(zoomInput).toHaveValue('1000');
    await expect(coordsInput).toHaveValue('2683000 / 1249000');

    // The filled input changes immediately; the URL reflects the map extent only after the pan completes.
    // @TODO https://are-zh.atlassian.net/browse/GHUB-939: This transition and state should be tracked via NGRX.
    await expect(page).toHaveURL(
      (url) =>
        url.searchParams.get('x') === '2683000' && url.searchParams.get('y') === '1249000' && url.searchParams.get('scale') === '1000',
    );

    await clickMapInTheList(favoriteTitle);
    await expect(zoomInput).toHaveValue('251');
    await expect(coordsInput).toHaveValue('2682260 / 1248390');

    // Delete favorite
    const deleteButton = favoriteItem.locator('//following-sibling::button');
    await deleteButton.click();
    const deletionDialog = page.locator('app-favourite-deletion-dialog');
    await expect(deletionDialog).toBeVisible();
    const confirmDelete = deletionDialog.locator('[data-test-id="submit-delete-favourite"]');
    await confirmDelete.click();
    await expect(deletionDialog).toBeHidden();

    // Assert deletion
    await selectTopic('Favoriten');
    await expect(page.locator('p', {hasText: favoriteTitle})).toHaveCount(0);
  });
});
