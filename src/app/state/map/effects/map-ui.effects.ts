import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {map} from 'rxjs/operators';
import {MapUiActions} from '../actions/map-ui.actions';
import {LegendActions} from '../actions/legend.actions';
import {ShareLinkActions} from '../actions/share-link.actions';
import {selectCurrentShareLinkItem} from '../selectors/current-share-link-item.selector';
import {Store} from '@ngrx/store';
import {filter, tap} from 'rxjs';
import {ShareLinkDialogComponent} from '../../../map/components/share-link-dialog/share-link-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteCreationDialogComponent} from '../../../map/components/favourite-creation-dialog/favourite-creation-dialog.component';
import {MapNoticeDialogComponent} from '../../../map/components/map-notice-dialog/map-notice-dialog.component';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {selectGb2WmsActiveMapItemsWithMapNotices} from '../selectors/active-map-items.selector';
import {FavouriteDeletionDialogComponent} from '../../../map/components/favourite-deletion-dialog/favourite-deletion-dialog.component';
import {Favourite} from '../../../shared/interfaces/favourite.interface';
import {ToolActions} from '../actions/tool.actions';
import {PrintActions} from '../actions/print.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {selectScreenMode} from '../../app/reducers/app-layout.reducer';
import {DataDownloadActions} from '../actions/data-download.actions';

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
            return DataDownloadActions.loadProducts();
        }
      }),
    );
  });

  public cancelToolsDependingOnShownSideDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.showMapSideDrawerContent),
      filter((value) => {
        switch (value.mapSideDrawerContent) {
          case 'print':
            return true;
          case 'data-download':
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
      ofType(MapUiActions.setLegendOverlayVisibility),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([_, screenMode]) => screenMode === 'mobile'),
      map(() => {
        return MapUiActions.hideUiElements();
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

  public loadDataDownloadProducts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.toggleToolMenu),
      filter((action) => action.tool === 'data-download'),
      map(() => DataDownloadActions.loadProducts()),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly dialogService: MatDialog,
  ) {}
}
