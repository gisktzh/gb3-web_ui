import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {filter, map} from 'rxjs';
import {MapImportActions} from '../actions/map-import.actions';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {selectMapImportState, selectServiceType} from '../reducers/map-import.reducer';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';
import {selectAllSelectedLayer} from '../selectors/map-import-layer-selection.selector';
import {ExternalServiceActiveMapItem} from '../../../map/models/external-service.model';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';

@Injectable()
export class MapImportEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

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

  public clearExternalMapItemLoadingStateAfterClearingAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.clearAll),
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
        let externalMapItem: ExternalServiceActiveMapItem;
        switch (mapImportState.serviceType!) {
          case 'wms':
            externalMapItem = ActiveMapItemFactory.createExternalWmsMapItem(
              mapImportState.url!,
              mapImportState.title!,
              layers.filter((layer): layer is ExternalWmsLayer => !!layer),
              mapImportState.imageFormat,
            );
            break;
          case 'kml':
            externalMapItem = ActiveMapItemFactory.createExternalKmlMapItem(
              mapImportState.url!,
              mapImportState.title!,
              layers.filter((layer): layer is ExternalKmlLayer => !!layer),
            );
            break;
        }
        return ActiveMapItemActions.addActiveMapItem({activeMapItem: externalMapItem, position: 0});
      }),
    );
  });
}
