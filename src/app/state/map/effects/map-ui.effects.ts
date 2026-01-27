import {Injectable, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {filter, tap} from 'rxjs';
import {map} from 'rxjs';
import {FavouriteCreationDialogComponent} from '../../../map/components/favourite-creation-dialog/favourite-creation-dialog.component';
import {FavouriteDeletionDialogComponent} from '../../../map/components/favourite-deletion-dialog/favourite-deletion-dialog.component';
import {MapNoticeDialogComponent} from '../../../map/components/map-notice-dialog/map-notice-dialog.component';
import {ShareLinkDialogComponent} from '../../../map/components/share-link-dialog/share-link-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {SearchActions} from '../../app/actions/search.actions';
import {selectScreenMode} from '../../app/reducers/app-layout.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';
import {LegendActions} from '../actions/legend.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ToolActions} from '../actions/tool.actions';
import {selectActiveTool} from '../reducers/tool.reducer';
import {selectGb2WmsActiveMapItemsWithMapNotices} from '../selectors/active-map-items.selector';
import {selectCurrentInternalShareLinkItem} from '../selectors/current-share-link-item.selector';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';
import {UrlActions} from '../../app/actions/url.actions';
import {selectUrlState} from '../../app/reducers/url.reducer';
import {DataDownloadEmailConfirmationDialogComponent} from '../../../map/components/map-tools/data-download-email-confirmation-dialog/data-download-email-confirmation-dialog.component';
import {MapImportDialogComponent} from '../../../map/components/map-tools/map-import/map-import-dialog/map-import-dialog.component';
import {MapAttributeFiltersItemActions} from '../actions/map-attribute-filters-item.actions';
import {selectMapAttributeFiltersItem} from '../selectors/map-attribute-filters-item.selector';
import {SymbolizationToGb3ConverterUtils} from 'src/app/shared/utils/symbolization-to-gb3-converter.utils';
import {ShareLinkItem} from 'src/app/shared/interfaces/share-link.interface';

const CREATE_FAVOURITE_DIALOG_MAX_WIDTH = 500;
const DELETE_FAVOURITE_DIALOG_MAX_WIDTH = 500;
const MAP_NOTICES_DIALOG_MAX_WIDTH = 968;

@Injectable()
export class MapUiEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly dialogService = inject(MatDialog);
  private readonly symbolizationToGb3ConverterUtils = inject(SymbolizationToGb3ConverterUtils);

  public hideUiElementsDependingOnShownSideDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showMapSideDrawerContent),
      map((value) => {
        switch (value.mapSideDrawerContent) {
          case 'print':
          case 'data-download':
            return MapUiActions.changeUiElementsVisibility({hideAllUiElements: true, hideUiToggleButton: true});
        }
      }),
    );
  });

  public loadProductsForDataDownloadSideDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showMapSideDrawerContent),
      filter((value) => value.mapSideDrawerContent === 'data-download'),
      map(() => DataDownloadProductActions.loadProductsAndRelevantProducts()),
    );
  });

  public cancelToolsDependingOnShownSideDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showMapSideDrawerContent),
      concatLatestFrom(() => this.store.select(selectActiveTool)),
      filter(([action, activeTool]) => {
        if (!activeTool) {
          return false;
        }
        switch (action.mapSideDrawerContent) {
          case 'print':
            return true;
          case 'data-download':
            // this side drawer is actively using a (selection) tool - so no cancellation necessary in this case
            return false;
        }
      }),
      map(() => ToolActions.cancelTool()),
    );
  });

  public showUiElementsAfterClosingSideDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.hideMapSideDrawerContent),
      map(() => MapUiActions.changeUiElementsVisibility({hideAllUiElements: false, hideUiToggleButton: false})),
    );
  });

  public closeSideDrawerAfterSwitchingPage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UrlActions.setPage),
      concatLatestFrom(() => this.store.select(selectUrlState)),
      filter(([_, urlState]) => urlState.mainPage !== 'maps' && urlState.previousPage === 'maps'),
      map(() => MapUiActions.hideMapSideDrawerContent()),
    );
  });

  public loadOrClearLegend$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setLegendOverlayVisibility),
      map(({isVisible}) => {
        if (isVisible) {
          return LegendActions.loadLegend();
        } else {
          return LegendActions.clearLegend();
        }
      }),
    );
  });

  public closeAttributeFilterWhenOpeningLegend$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setLegendOverlayVisibility),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([{isVisible}, screenMode]) => isVisible && screenMode !== 'mobile'),
      map(() => {
        return MapUiActions.setAttributeFilterVisibility({isVisible: false});
      }),
    );
  });

  public closeAttributeFilterIfAttributeFilterItemIsUndefined$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeActiveMapItem),
      concatLatestFrom(() => this.store.select(selectMapAttributeFiltersItem)),
      filter(([__, attributeFilterItem]) => attributeFilterItem === undefined),
      map(() => MapUiActions.setAttributeFilterVisibility({isVisible: false})),
    );
  });

  public showElevationProfileOverlay$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ElevationProfileActions.loadProfile),
      map(() => MapUiActions.setElevationProfileOverlayVisibility({isVisible: true})),
    );
  });

  public hideElevationProfileOverlayOnNavigate = createEffect(() => {
    return this.actions$.pipe(
      ofType(UrlActions.setPage),
      concatLatestFrom(() => this.store.select(selectUrlState)),
      filter(([_, urlState]) => urlState.mainPage !== 'maps' && urlState.previousPage === 'maps'),
      map(() => MapUiActions.setElevationProfileOverlayVisibility({isVisible: false})),
    );
  });

  public showOrHideMapUiElements$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setLegendOverlayVisibility, MapUiActions.setFeatureInfoVisibility),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([_, screenMode]) => screenMode === 'mobile'),
      map(() => MapUiActions.changeUiElementsVisibility({hideAllUiElements: true, hideUiToggleButton: false})),
    );
  });

  public clearFeatureInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setFeatureInfoVisibility),
      filter(({isVisible}) => !isVisible),
      map(() => MapConfigActions.clearFeatureInfoContent()),
    );
  });

  public openShareLinkDialog$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.showShareLinkDialog),
        tap(() => {
          this.dialogService.open(ShareLinkDialogComponent, {
            panelClass: PanelClass.ApiWrapperDialog,
            restoreFocus: false,
            autoFocus: false,
          });
        }),
      );
    },
    {dispatch: false},
  );

  public createShareLinkAfterBottomSheetOpen$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showBottomSheet),
      filter(({bottomSheetContent}) => bottomSheetContent === 'share-link'),
      concatLatestFrom(() => this.store.select(selectCurrentInternalShareLinkItem)),
      map(
        ([_, internalShareLinkItem]) =>
          ({
            ...internalShareLinkItem,
            drawings: this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(internalShareLinkItem.drawings),
            measurements: this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(internalShareLinkItem.measurements),
          }) as ShareLinkItem,
      ),
      map((shareLinkItem) => ShareLinkActions.createItem({item: shareLinkItem})),
    );
  });

  public createShareLinkAfterDialogOpen$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showShareLinkDialog),
      concatLatestFrom(() => this.store.select(selectCurrentInternalShareLinkItem)),
      map(
        ([_, internalShareLinkItem]) =>
          ({
            ...internalShareLinkItem,
            drawings: this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(internalShareLinkItem.drawings),
            measurements: this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(internalShareLinkItem.measurements),
          }) as ShareLinkItem,
      ),
      map((shareLinkItem) => ShareLinkActions.createItem({item: shareLinkItem})),
    );
  });

  public openCreateFavouriteDialog$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.showCreateFavouriteDialog),
        tap(() =>
          this.dialogService.open(FavouriteCreationDialogComponent, {
            panelClass: PanelClass.ApiWrapperDialog,
            restoreFocus: false,
            maxWidth: CREATE_FAVOURITE_DIALOG_MAX_WIDTH,
            autoFocus: false,
          }),
        ),
      );
    },
    {dispatch: false},
  );

  public openDeleteFavouriteDialog$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.showDeleteFavouriteDialog),
        tap(({favouriteToDelete}) =>
          this.dialogService.open<FavouriteDeletionDialogComponent, {favourite: Favourite}, boolean>(FavouriteDeletionDialogComponent, {
            data: {favourite: favouriteToDelete},
            panelClass: PanelClass.ApiWrapperDialog,
            restoreFocus: false,
            maxWidth: DELETE_FAVOURITE_DIALOG_MAX_WIDTH,
            autoFocus: false,
          }),
        ),
      );
    },
    {dispatch: false},
  );

  public openMapNoticesDialogAndMarkThemAsRead$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showMapNoticesDialog),
      concatLatestFrom(() => this.store.select(selectGb2WmsActiveMapItemsWithMapNotices)),
      tap(([_, gb2WmsActiveMapItemsWithMapNotices]) =>
        this.dialogService.open(MapNoticeDialogComponent, {
          panelClass: PanelClass.ApiWrapperDialog,
          restoreFocus: false,
          data: gb2WmsActiveMapItemsWithMapNotices,
          maxWidth: MAP_NOTICES_DIALOG_MAX_WIDTH,
          autoFocus: false,
        }),
      ),
      map(() => ActiveMapItemActions.markAllActiveMapItemNoticeAsRead()),
    );
  });

  public loadDataDownloadFederation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.toggleToolMenu),
      filter((action) => action.tool === 'data-download'),
      map(() => DataDownloadRegionActions.loadFederation()),
    );
  });

  public loadDataDownloadCanton$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.toggleToolMenu),
      filter((action) => action.tool === 'data-download'),
      map(() => DataDownloadRegionActions.loadCanton()),
    );
  });

  public loadDataDownloadMunicipalities$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.toggleToolMenu),
      filter((action) => action.tool === 'data-download'),
      map(() => DataDownloadRegionActions.loadMunicipalities()),
    );
  });

  public closeBottomSheetAfterSelectingSearchResult$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.selectMapSearchResult),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([_, screenMode]) => screenMode === 'mobile'),
      map(() => MapUiActions.hideBottomSheet()),
    );
  });

  public openDataDownloadEmailConfirmationDialog$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.showDataDownloadEmailConfirmationDialog),
        tap(() =>
          this.dialogService.open<DataDownloadEmailConfirmationDialogComponent>(DataDownloadEmailConfirmationDialogComponent, {
            panelClass: PanelClass.ApiWrapperDialog,
            restoreFocus: false,
            autoFocus: false,
          }),
        ),
      );
    },
    {dispatch: false},
  );

  public openMapImportDialog$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.showMapImportDialog),
        tap(() =>
          this.dialogService.open<MapImportDialogComponent>(MapImportDialogComponent, {
            panelClass: PanelClass.ApiWrapperDialog,
            restoreFocus: false,
            disableClose: true,
            autoFocus: false,
          }),
        ),
      );
    },
    {dispatch: false},
  );

  public openAttributeFilterOverlay = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId),
      map(() => MapUiActions.setAttributeFilterVisibility({isVisible: true})),
    );
  });
}
