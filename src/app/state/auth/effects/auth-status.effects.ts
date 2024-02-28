import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {combineLatestWith, first, take, tap} from 'rxjs';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {AuthService} from '../../../auth/auth.service';
import {Store} from '@ngrx/store';
import {selectCurrentShareLinkItem} from '../../map/selectors/current-share-link-item.selector';
import {SessionStorageService} from '../../../shared/services/session-storage.service';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {filter, map} from 'rxjs/operators';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {ActiveMapItemActions} from '../../map/actions/active-map-item.actions';
import {DrawingActions} from '../../map/actions/drawing.actions';
import {selectItems} from '../../map/reducers/active-map-item.reducer';
import {selectDrawings} from '../../map/reducers/drawing.reducer';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {TimeExtentUtils} from '../../../shared/utils/time-extent.utils';

@Injectable()
export class AuthStatusEffects {
  public login$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthStatusActions.performLogin),
        concatLatestFrom(() => this.store.select(selectCurrentShareLinkItem)),
        tap(([_, shareLinkItem]) => {
          this.sessionStorageService.set('shareLinkItem', JSON.stringify(shareLinkItem));
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
          this.sessionStorageService.set('shareLinkItem', JSON.stringify(shareLinkItem));
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
      map(() => {
        const shareLinkItemJson = this.sessionStorageService.get('shareLinkItem');
        this.sessionStorageService.remove('shareLinkItem');
        let shareLinkItemFixed = shareLinkItemJson ? (JSON.parse(shareLinkItemJson) as ShareLinkItem) : undefined;
        if (shareLinkItemFixed) {
          shareLinkItemFixed = {
            ...shareLinkItemFixed,
            content: shareLinkItemFixed.content.map((content) => {
              return {
                ...content,
                timeExtent: content.timeExtent
                  ? {
                      start: TimeExtentUtils.getUTCDate(content.timeExtent?.start.toString()),
                      end: TimeExtentUtils.getUTCDate(content.timeExtent?.end.toString()),
                    }
                  : undefined,
                attributeFilters: content.attributeFilters ?? undefined,
              };
            }),
          };
        }

        // return shareLinkItemJson ? (JSON.parse(shareLinkItemJson) as ShareLinkItem) : undefined;
        return shareLinkItemFixed;
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

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly store: Store,
    private readonly sessionStorageService: SessionStorageService,
    private readonly shareLinkService: Gb3ShareLinkService,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}
}
