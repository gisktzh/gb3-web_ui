import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {LayerCatalogItem} from '../../../shared/models/gb3-api.interfaces';
import {TakeUntilDestroy} from '../../../shared/directives/take-until-destroy.directive';
import {selectLayerCatalogItems} from '../../../core/state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../core/state/map/actions/layer-catalog.actions';
import {takeUntil} from 'rxjs';

@Component({
  selector: 'layer-catalog',
  templateUrl: './layer-catalog.component.html',
  styleUrls: ['./layer-catalog.component.scss']
})
export class LayerCatalogComponent extends TakeUntilDestroy implements OnInit {
  public layerCatalogItems: LayerCatalogItem[] = [];
  private readonly layerCatalogItems$ = this.store.select(selectLayerCatalogItems);

  constructor(private readonly store: Store, private readonly gb3TopicsService: Gb3TopicsService) {
    super();
  }

  public async ngOnInit() {
    this.layerCatalogItems$.pipe(takeUntil(this.unsubscribed$)).subscribe((value) => {
      this.layerCatalogItems = value;
    });

    await this.loadLayerCatalogItems();
  }

  private async loadLayerCatalogItems() {
    const topics = await this.gb3TopicsService.loadTopics();
    this.store.dispatch(LayerCatalogActions.setLayerCatalog(topics));
  }
}
