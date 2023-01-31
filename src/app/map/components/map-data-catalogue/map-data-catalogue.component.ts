import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectLayerCatalogItems, selectLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {LoadingState} from '../../../shared/types/loading-state';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Topic, Map, MapLayer} from '../../../shared/interfaces/topic.interface';

@Component({
  selector: 'map-data-catalogue',
  templateUrl: './map-data-catalogue.component.html',
  styleUrls: ['./map-data-catalogue.component.scss']
})
export class MapDataCatalogueComponent implements OnInit, OnDestroy {
  public topics: Topic[] = [];
  public loadingState: LoadingState = 'undefined';

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly topics$ = this.store.select(selectLayerCatalogItems);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public async ngOnInit() {
    this.initSubscriptions();
    await this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public addActiveMap(map: Map) {
    this.addActiveItem(new ActiveMapItem(map));
  }

  public addActiveLayer(map: Map, layer: MapLayer) {
    this.addActiveItem(new ActiveMapItem(map, layer));
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.topics$.subscribe((value) => {
        this.topics = value;
      })
    );

    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap(async (value) => {
            this.loadingState = value;
          })
        )
        .subscribe()
    );
  }
}
