import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {LayerCatalogItem, Topic} from '../../../shared/models/gb3-api.interfaces';
import {selectLayerCatalogItems, selectLoadingState} from '../../../core/state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../core/state/map/actions/layer-catalog.actions';
import {Subscription, tap} from 'rxjs';
import {ActiveTopic} from '../../models/active-topic.model';
import {ActiveTopicActions} from '../../../core/state/map/actions/active-topic.actions';
import {LoadingState} from '../../../shared/enums/loading-state';

@Component({
  selector: 'layer-catalog',
  templateUrl: './layer-catalog.component.html',
  styleUrls: ['./layer-catalog.component.scss']
})
export class LayerCatalogComponent implements OnInit, OnDestroy {
  public layerCatalogItems: LayerCatalogItem[] = [];
  public loadingState = LoadingState.UNDEFINED;

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly layerCatalogItems$ = this.store.select(selectLayerCatalogItems);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public get isLoading() {
    return this.loadingState !== LoadingState.LOADED;
  }

  public async ngOnInit() {
    this.initSubscriptions();
    await this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public addActiveTopic(topic: Topic) {
    this.store.dispatch(ActiveTopicActions.addActiveTopic(new ActiveTopic(topic)));
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
