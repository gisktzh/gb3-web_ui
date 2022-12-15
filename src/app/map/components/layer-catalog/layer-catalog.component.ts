import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {LayerCatalogItem, Topic} from '../../../shared/models/gb3-api.interfaces';
import {selectLayerCatalogItems} from '../../../core/state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../core/state/map/actions/layer-catalog.actions';
import {Subscription} from 'rxjs';
import {ActiveTopic} from '../../models/active-topic.model';
import {ActiveTopicActions} from '../../../core/state/map/actions/active-topic.actions';

@Component({
  selector: 'layer-catalog',
  templateUrl: './layer-catalog.component.html',
  styleUrls: ['./layer-catalog.component.scss']
})
export class LayerCatalogComponent implements OnInit, OnDestroy {
  public layerCatalogItems: LayerCatalogItem[] = [];

  private readonly layerCatalogItems$ = this.store.select(selectLayerCatalogItems);
  private readonly subscription = new Subscription();

  constructor(private readonly store: Store, private readonly gb3TopicsService: Gb3TopicsService) {}

  public async ngOnInit() {
    this.subscription.add(
      this.layerCatalogItems$.subscribe((value) => {
        this.layerCatalogItems = value;
      })
    );

    await this.loadLayerCatalogItems();
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public addActiveTopic(topic: Topic) {
    this.store.dispatch(ActiveTopicActions.addActiveTopic(new ActiveTopic(topic)));
  }

  private async loadLayerCatalogItems() {
    const topics = await this.gb3TopicsService.loadTopics();
    this.store.dispatch(LayerCatalogActions.setLayerCatalog(topics));
  }
}
