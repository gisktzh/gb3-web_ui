import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {filter, map} from 'rxjs/operators';
import {MapImportActions} from '../actions/map-import.actions';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {selectMapImportState, selectServiceType} from '../reducers/map-import.reducer';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';
import {ExternalMapItemWithFilteredLayersUtils} from '../../../map/utils/external-map-item-with-filtered-layers.utils';
import {selectAllSelectedLayer} from '../selectors/map-import-layer-selection.selector';

@Injectable()
export class MapImportEffects {
  public clearMapImportStateAfterAddingExternalMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addActiveMapItem),
      filter(({activeMapItem}) => activeMapItem.settings.type === 'externalService'),
      map(() => MapImportActions.clearAll()),
    );
  });

  public clearExternalMapItemLoadingStateAfterChangingServiceType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.setServiceType),
      map(() => ExternalMapItemActions.clearLoadingState()),
    );
  });

  public loadExternalMapItemAfterSettingUrl$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.setUrl),
      concatLatestFrom(() => this.store.select(selectServiceType)),
      filter(([{url}, serviceType]) => !!url && !!serviceType),
      map(([{url}, serviceType]) => ExternalMapItemActions.loadItem({serviceType: serviceType!, url})),
    );
  });

  public addExternalMapItemToMap$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.importExternalMapItem),
      concatLatestFrom(() => [this.store.select(selectMapImportState), this.store.select(selectAllSelectedLayer)]),
      filter(([_, mapImportState, __]) => !!mapImportState.serviceType && !!mapImportState.url && !!mapImportState.title),
      map(([_, mapImportState, layers]) => {
        const externalMapItem = ExternalMapItemWithFilteredLayersUtils.createExternalMapItemWithFilteredLayers(
          mapImportState.serviceType!,
          mapImportState.url!,
          mapImportState.title!,
          layers,
        );
        return ExternalMapItemActions.addItemToMap({externalMapItem});
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {}
}
