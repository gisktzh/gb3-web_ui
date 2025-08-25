import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {MapLayer} from '../../../../../shared/interfaces/topic.interface';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectScale} from '../../../../../state/map/reducers/map-config.reducer';
import {MatIcon} from '@angular/material/icon';
import {CdkDragHandle} from '@angular/cdk/drag-drop';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatTooltip} from '@angular/material/tooltip';
import {NgClass} from '@angular/common';
import {LayerTooltipPipe} from '../../../../../shared/pipes/layer-tooltip.pipe';

@Component({
  selector: 'active-map-item-layer',
  templateUrl: './active-map-item-layer.component.html',
  styleUrls: ['./active-map-item-layer.component.scss'],
  imports: [MatIcon, CdkDragHandle, MatCheckbox, MatTooltip, NgClass, LayerTooltipPipe],
})
export class ActiveMapItemLayerComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public layer!: MapLayer;

  public scale: number = 0;
  private readonly scale$ = this.store.select(selectScale);
  private readonly subscriptions: Subscription = new Subscription();

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
