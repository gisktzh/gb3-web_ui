import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {catchError, filter, map} from 'rxjs/operators';
import {MAP_LOADER_SERVICE} from '../../../app.module';
import {of, switchMap, tap} from 'rxjs';
import {MapImportActions} from '../actions/map-import.actions';
import {MapLoaderService} from '../../../map/interfaces/map-loader.service';
import {ExternalServiceCouldNotBeLoaded} from '../../../shared/errors/map-import.errors';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ExternalMapItemWithFilteredLayersUtils} from '../../../map/utils/external-map-item-with-filtered-layers.utils';
import {selectAllSelectedLayerIds} from '../selectors/map-import-layer-selection.selector';
import {selectExternalMapItem, selectTitle} from '../reducers/map-import.reducer';

@Injectable()
export class MapImportEffects {
  public loadExternalMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.loadExternalMapItem),
      switchMap(({url, serviceType}) =>
        this.mapLoaderService.loadExternalService(url, serviceType).pipe(
          map((externalMapItem) => {
            return MapImportActions.setExternalMapItem({externalMapItem});
          }),
          catchError((error: unknown) => of(MapImportActions.setExternalMapItemError({error}))),
        ),
      ),
    );
  });

  public throwExternalMapItemError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapImportActions.setExternalMapItemError),
        tap(({error}) => {
          throw new ExternalServiceCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  public setLayerSelectionsFromExternalMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.setExternalMapItem),
      map(({externalMapItem}) => {
        switch (externalMapItem.settings.mapServiceType) {
          case 'wms':
          case 'kml':
            return MapImportActions.setLayerSelections({layers: externalMapItem.settings.layers});
        }
      }),
    );
  });

  public addExternalMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.addExternalMapItem),
      concatLatestFrom(() => [
        this.store.select(selectExternalMapItem),
        this.store.select(selectAllSelectedLayerIds),
        this.store.select(selectTitle),
      ]),
      filter(([_, externalMapItem, selectedLayerIds, title]) => !!externalMapItem && !!title),
      map(([_, externalMapItem, selectedLayerIds, title]) => {
        const externalMapItemWithFilteredLayers = ExternalMapItemWithFilteredLayersUtils.createExternalMapItemWithFilteredLayers(
          externalMapItem!,
          selectedLayerIds,
          title!,
        );
        return ActiveMapItemActions.addActiveMapItem({activeMapItem: externalMapItemWithFilteredLayers, position: 0});
      }),
    );
  });

  public clearMapImportStateAfterAddingExternalMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addActiveMapItem),
      filter(({activeMapItem}) => activeMapItem.settings.type === 'externalService'),
      map(() => MapImportActions.clearExternalMapItemAndSelection()),
    );
  });

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_LOADER_SERVICE) private readonly mapLoaderService: MapLoaderService,
    private readonly store: Store,
  ) {}
}
