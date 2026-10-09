import {test, expect, describeA11y} from '../fixtures';

const favouriteApiUrl = 'https://maps.zh.ch/gb3/v4/user/favorites';
const initialCenter = {x: 2_682_260, y: 1_248_390};
const initialScale = 251;
const movedCenter = {x: 2_683_000, y: 1_249_000};
const movedScale = 1_000;
const movedCoordinates = `${movedCenter.x} / ${movedCenter.y}`;
const favouriteExtentCases = [
  {
    description: 'both extent options checked',
    harPostFix: undefined,
    storeCenter: true,
    storeScale: true,
    expectedStoredExtent: {east: initialCenter.x, north: initialCenter.y, scaledenom: initialScale},
    expectedCenter: initialCenter,
    expectedScale: initialScale,
  },
  {
    description: 'both extent options unchecked',
    harPostFix: 'both-off',
    storeCenter: false,
    storeScale: false,
    expectedStoredExtent: {east: null, north: null, scaledenom: null},
    expectedCenter: movedCenter,
    expectedScale: movedScale,
  },
  {
    description: 'only center checked',
    harPostFix: 'center-only',
    storeCenter: true,
    storeScale: false,
    expectedStoredExtent: {east: initialCenter.x, north: initialCenter.y, scaledenom: null},
    expectedCenter: initialCenter,
    expectedScale: movedScale,
  },
  {
    description: 'only scale checked',
    harPostFix: 'scale-only',
    storeCenter: false,
    storeScale: true,
    expectedStoredExtent: {east: null, north: null, scaledenom: initialScale},
    expectedCenter: movedCenter,
    expectedScale: initialScale,
  },
];

test.describe('Favorites layers', () => {
  for (const {
    description,
    harPostFix,
    storeCenter,
    storeScale,
    expectedStoredExtent,
    expectedCenter,
    expectedScale,
  } of favouriteExtentCases) {
    test(`adds, restores, and removes a favorite with ${description}`, async ({
      page,
      openFavouriteCreationDialog,
      selectTopic,
      clickMapInTheList,
      clickByDataTestId,
      zoom,
      useHar,
      captureConsole,
    }) => {
      test.slow();

      captureConsole();
      await useHar(harPostFix);

      const favouriteDialog = await openFavouriteCreationDialog();

      const favoriteTitle = 'MyTestFavorite';

      const nameInput = favouriteDialog.locator('[data-test-id="input-favourite-title"]');
      await expect(nameInput).toBeVisible();
      await nameInput.fill(favoriteTitle);

      const storeCenterCheckbox = favouriteDialog.locator('[data-test-id="input-favourite-store-center"] input');
      const storeScaleCheckbox = favouriteDialog.locator('[data-test-id="input-favourite-store-scale"] input');
      await expect(storeCenterCheckbox).toBeChecked();
      await expect(storeScaleCheckbox).toBeChecked();
      await storeCenterCheckbox.setChecked(storeCenter);
      await storeScaleCheckbox.setChecked(storeScale);
      await expect(storeCenterCheckbox).toBeChecked({checked: storeCenter});
      await expect(storeScaleCheckbox).toBeChecked({checked: storeScale});

      const saveButton = favouriteDialog.locator('[data-test-id="submit-create-favourite"]');
      await expect(saveButton).toBeEnabled();
      const [createRequest, favouritesResponse] = await Promise.all([
        page.waitForRequest((request) => request.url() === favouriteApiUrl && request.method() === 'POST'),
        page.waitForResponse((response) => response.url() === favouriteApiUrl && response.request().method() === 'GET'),
        saveButton.click(),
      ]);
      expect(createRequest.postDataJSON()).toEqual(expect.objectContaining({title: favoriteTitle, ...expectedStoredExtent}));
      expect(await favouritesResponse.json()).toEqual(
        expect.arrayContaining([expect.objectContaining({title: favoriteTitle, ...expectedStoredExtent})]),
      );

      await expect(favouriteDialog).toBeHidden();
      await page.waitForLoadState('networkidle');

      // Wait until favorite appears in the list
      await selectTopic('Favoriten');
      const favoriteItem = page.locator('p', {hasText: favoriteTitle});
      await expect(favoriteItem).toBeVisible({timeout: 10000});

      // Move away from the stored extent, then restore it by adding the favorite.
      const zoomInput = page.locator('[data-test-id="input-map-scale"]');
      const coordsInput = page.locator('[data-test-id="input-map-coordinates"]');
      await zoom(movedScale);
      await coordsInput.fill(movedCoordinates);
      await expect(zoomInput).toHaveValue(movedScale.toString());
      await expect(coordsInput).toHaveValue(movedCoordinates);

      // The filled input changes immediately; the URL reflects the map extent only after the pan completes.
      // @TODO https://are-zh.atlassian.net/browse/GHUB-939: This transition and state should be tracked via NGRX.
      await expect(page).toHaveURL(
        (url) =>
          url.searchParams.get('x') === movedCenter.x.toString() &&
          url.searchParams.get('y') === movedCenter.y.toString() &&
          url.searchParams.get('scale') === movedScale.toString(),
      );

      await clickByDataTestId('remove-all-active-maps');
      await expect(page.locator('active-map-item')).toHaveCount(0);

      await clickMapInTheList(favoriteTitle, 'AWA-Standorte');
      await expect(zoomInput).toHaveValue(expectedScale.toString());
      await expect(coordsInput).toHaveValue(`${expectedCenter.x} / ${expectedCenter.y}`);
      await expect(page).toHaveURL(
        (url) =>
          url.searchParams.get('x') === expectedCenter.x.toString() &&
          url.searchParams.get('y') === expectedCenter.y.toString() &&
          url.searchParams.get('scale') === expectedScale.toString(),
      );

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
  }

  describeA11y(() => {
    test('has no detectable accessibility violations while showing the favourite creation dialog', async ({
      openFavouriteCreationDialog,
      useHar,
      captureConsole,
      checkA11y,
    }) => {
      test.slow();

      captureConsole();
      await useHar();

      await openFavouriteCreationDialog();

      await checkA11y({include: ['favourite-creation-dialog']});
    });
  });
});
