import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectLayerCatalogItems, selectLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {LoadingState} from '../../../shared/types/loading-state';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {LayerCatalogItem, Topic, TopicLayer} from '../../../shared/interfaces/topic.interface';

@Component({
  selector: 'layer-catalog',
  templateUrl: './layer-catalog.component.html',
  styleUrls: ['./layer-catalog.component.scss']
})
export class LayerCatalogComponent implements OnInit, OnDestroy {
  public layerCatalogItems: LayerCatalogItem[] = [];
  public loadingState: LoadingState = 'undefined';

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly layerCatalogItems$ = this.store.select(selectLayerCatalogItems);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public async ngOnInit() {
    this.initSubscriptions();
    await this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public addActiveTopic(topic: Topic) {
    this.addActiveItem(new ActiveMapItem(topic));
  }

  public addActiveLayer(topic: Topic, layer: TopicLayer) {
    this.addActiveItem(new ActiveMapItem(topic, layer));
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.layerCatalogItems$.subscribe((value) => {
        this.layerCatalogItems = value;
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
