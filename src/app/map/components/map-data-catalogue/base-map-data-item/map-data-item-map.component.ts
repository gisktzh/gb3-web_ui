import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseMapDataItemComponent} from './base-map-data-item.component';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';

@Component({
  selector: 'map-data-item-map',
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss'],
})
export class MapDataItemMapComponent extends BaseMapDataItemComponent implements OnInit, OnDestroy {
  @Input() public override layers: MapLayer[] = [];
  @Input() public override imageUrl!: string;
  @Input() public override gb2Url: string | null = null;

  @Output() public override readonly addLayerEvent = new EventEmitter<MapLayer>();

  public override loadingState: LoadingState = 'loaded';

  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {
    super();
  }

  public ngOnInit() {
    // only add subscription if the item is a gb2-only item
    if (this.gb2Url) {
      this.showExpandButton = false;
      this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
