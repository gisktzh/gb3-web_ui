import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {BaseMapDataItemComponent} from './base-map-data-item.component';

@Component({
  selector: 'map-data-item-map',
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss'],
  standalone: false,
})
export class MapDataItemMapComponent extends BaseMapDataItemComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public override layers: MapLayer[] = [];
  @Input() public override imageUrl!: string;
  @Input() public override gb2Url: string | null = null;

  @Output() public override readonly addLayerEvent = new EventEmitter<MapLayer>();

  public override loadingState: LoadingState = 'loaded';

  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

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
