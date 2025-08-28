import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {combineLatestWith, first, take, tap} from 'rxjs';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {AuthService} from '../../../auth/auth.service';
import {Store} from '@ngrx/store';
import {selectCurrentShareLinkItem} from '../../map/selectors/current-share-link-item.selector';
import {SessionStorageService} from '../../../shared/services/session-storage.service';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {filter, map} from 'rxjs';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {ActiveMapItemActions} from '../../map/actions/active-map-item.actions';
import {DrawingActions} from '../../map/actions/drawing.actions';
import {selectItems} from '../../map/selectors/active-map-items.selector';
import {selectDrawings} from '../../map/reducers/drawing.reducer';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {MapService} from '../../../map/interfaces/map.service';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {defaultActiveMapItemConfiguration} from '../../../shared/interfaces/active-map-item-configuration.interface';
import {MAP_SERVICE} from '../../../app.tokens';

@Injectable()
export class AuthStatusEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly shareLinkService = inject(Gb3ShareLinkService);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  public login$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthStatusActions.performLogin),
        concatLatestFrom(() => this.store.select(selectCurrentShareLinkItem)),
        tap(([_, shareLinkItem]) => {
          this.sessionStorageService.set('shareLinkItem', this.sessionStorageService.stringifyJson(shareLinkItem));
          this.authService.login();
        }),
      );
    },
    {dispatch: false},
  );

  public logout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthStatusActions.performLogout),
        concatLatestFrom(() => this.store.select(selectCurrentShareLinkItem)),
        tap(([{isForced}, shareLinkItem]) => {
          this.sessionStorageService.set('shareLinkItem', this.sessionStorageService.stringifyJson(shareLinkItem));
          this.authService.logout(isForced);
        }),
      );
    },
    {dispatch: false},
  );

  public restoreApplicationAfterRedirectOrRefresh$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LayerCatalogActions.setLayerCatalog),
      first(),
      map((): ShareLinkItem | undefined => {
        const shareLinkItemString = this.sessionStorageService.get('shareLinkItem');
        this.sessionStorageService.remove('shareLinkItem');

        const shareLinkItem: ShareLinkItem | undefined = shareLinkItemString
          ? this.sessionStorageService.parseJson<ShareLinkItem>(shareLinkItemString)
          : undefined;

        return shareLinkItem
          ? {
              ...shareLinkItem,
              content: shareLinkItem?.content.map((content) => {
                return {
                  ...defaultActiveMapItemConfiguration,
                  ...content,
                };
              }),
            }
          : undefined;
      }),
      filter((shareLinkItem): shareLinkItem is ShareLinkItem => !!shareLinkItem),
      map((shareLinkItem) => {
        const mapRestoreItem = this.shareLinkService.createMapRestoreItem(shareLinkItem, true);
        return AuthStatusActions.completeRestoreApplication({mapRestoreItem});
      }),
    );
  });

  public setActiveMapItemsAfterApplicationRestore$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthStatusActions.completeRestoreApplication),
      map(({mapRestoreItem}) => {
        return ActiveMapItemActions.addInitialMapItems({initialMapItems: mapRestoreItem.activeMapItems});
      }),
    );
  });

  public setInitialDrawingsAfterApplicationRestore$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthStatusActions.completeRestoreApplication),
      map(({mapRestoreItem}) => {
        return DrawingActions.addDrawings({drawings: mapRestoreItem.drawings});
      }),
    );
  });

  public addInitialDrawingsToMapAfterApplicationRestore$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthStatusActions.completeRestoreApplication),
        combineLatestWith(this.store.select(selectItems), this.store.select(selectDrawings)),
        // ensure that the active map items and drawings have been set before continuing
        filter(
          ([{mapRestoreItem}, activeMapItems, drawings]) =>
            mapRestoreItem.activeMapItems.length === activeMapItems.length && mapRestoreItem.drawings.length === drawings.length,
        ),
        take(1),
        tap(([_, activeMapItems, drawings]) => {
          activeMapItems.filter(isActiveMapItemOfType(DrawingActiveMapItem)).forEach((drawingActiveMapItem) => {
            this.mapService.getToolService().addExistingDrawingsToLayer(
              drawings.filter((drawing) => drawing.source === drawingActiveMapItem.settings.userDrawingLayer),
              drawingActiveMapItem.settings.userDrawingLayer,
            );
          });
        }),
      );
    },
    {dispatch: false},
  );
}
