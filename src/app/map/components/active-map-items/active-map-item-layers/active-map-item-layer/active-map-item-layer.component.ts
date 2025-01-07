import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {MapLayer} from '../../../../../shared/interfaces/topic.interface';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectScale} from '../../../../../state/map/reducers/map-config.reducer';

@Component({
  selector: 'active-map-item-layer',
  templateUrl: './active-map-item-layer.component.html',
  styleUrls: ['./active-map-item-layer.component.scss'],
  standalone: false,
})
export class ActiveMapItemLayerComponent implements OnInit, OnDestroy {
  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public layer!: MapLayer;

  public scale: number = 0;
  private readonly scale$ = this.store.select(selectScale);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.subscriptions.add(this.scale$.pipe(tap((scale) => (this.scale = scale))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleSublayerVisibility(layer: MapLayer) {
    this.store.dispatch(
      ActiveMapItemActions.setSublayerVisibility({visible: !layer.visible, activeMapItem: this.activeMapItem, layerId: layer.id}),
    );
  }
}
