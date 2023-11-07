import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';
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
import {PrintActions} from '../actions/print.actions';
import {ShareLinkActions} from '../actions/share-link.actions';
import {ToolActions} from '../actions/tool.actions';
import {selectActiveTool} from '../reducers/tool.reducer';
import {selectGb2WmsActiveMapItemsWithMapNotices} from '../selectors/active-map-items.selector';
import {selectCurrentShareLinkItem} from '../selectors/current-share-link-item.selector';

const CREATE_FAVOURITE_DIALOG_MAX_WIDTH = 500;
const DELETE_FAVOURITE_DIALOG_MAX_WIDTH = 500;
const MAP_NOTICES_DIALOG_MAX_WIDTH = 968;

@Injectable()
export class MapUiEffects {
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

  public loadDataForSideDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showMapSideDrawerContent),
      map((value) => {
        switch (value.mapSideDrawerContent) {
          case 'print':
            return PrintActions.loadPrintCapabilities();
          case 'data-download':
            return DataDownloadProductActions.loadProductsAndRelevantProducts();
        }
      }),
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
      map(() => {
        return MapUiActions.changeUiElementsVisibility({hideAllUiElements: false, hideUiToggleButton: false});
      }),
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

  public showOrHideMapUiElements$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setLegendOverlayVisibility, MapUiActions.setFeatureInfoVisibility),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([_, screenMode]) => screenMode === 'mobile'),
      map(() => {
        return MapUiActions.changeUiElementsVisibility({hideAllUiElements: true, hideUiToggleButton: false});
      }),
    );
  });

  public clearFeatureInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setFeatureInfoVisibility),
      filter(({isVisible}) => !isVisible),
      map(({isVisible}) => {
        return MapConfigActions.clearFeatureInfoContent();
      }),
    );
  });

  public openShareLinkDialogAndCreateShareLink$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showShareLinkDialog),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      tap(([__, screenMode]) => {
        if (screenMode === 'mobile') {
          return this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'share-link'}));
        } else {
          this.dialogService.open(ShareLinkDialogComponent, {
            panelClass: PanelClass.ApiWrapperDialog,
            restoreFocus: false,
          });
        }
      }),
      concatLatestFrom(() => this.store.select(selectCurrentShareLinkItem)),
      map(([_, shareLinkItem]) => {
        return ShareLinkActions.createItem({item: shareLinkItem});
      }),
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
        }),
      ),
      map(() => {
        return ActiveMapItemActions.markAllActiveMapItemNoticeAsRead();
      }),
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

  public clearSearchTermAfterClosingBottomSheet$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.hideBottomSheet),
      map(() => {
        return SearchActions.clearSearchTerm();
      }),
    );
  });
  public cancelToolAfterHidingUiElements$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.changeUiElementsVisibility),
      concatLatestFrom(() => this.store.select(selectActiveTool)),
      filter(([{hideAllUiElements}, activeTool]) => hideAllUiElements && activeTool !== undefined),
      map(() => ToolActions.cancelTool()),
    );
  });
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly dialogService: MatDialog,
  ) {}
}
