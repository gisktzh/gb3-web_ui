import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectScale} from '../../../../state/map/reducers/map-config.reducer';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {NgClass} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {HighlightSearchQueryPipe} from '../../../../shared/pipes/highlight-search-query.pipe';
import {LayerTooltipPipe} from '../../../../shared/pipes/layer-tooltip.pipe';

@Component({
  selector: 'map-data-item-map-layer',
  templateUrl: './map-data-item-map-layer.component.html',
  styleUrls: ['./map-data-item-map-layer.component.scss'],
  imports: [MatCheckbox, MatIconButton, MatIcon, NgClass, MatTooltip, HighlightSearchQueryPipe, LayerTooltipPipe],
})
export class MapDataItemMapLayerComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public layer!: MapLayer;
  @Input() public filterString: string | undefined = undefined;
  @Input() public isMapHovered: boolean = false;
  @Input() public isLayerHovered: boolean = false;

  @Output() public readonly addLayerEvent = new EventEmitter<void>();

  public visibleAtCurrentScale: boolean = true;

  private readonly scale$ = this.store.select(selectScale);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.subscriptions.add(
      this.scale$
        .pipe(tap((scale) => (this.visibleAtCurrentScale = this.layer.minScale < scale && scale <= this.layer.maxScale)))
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  public addItemLayer() {
    this.addLayerEvent.emit();
  }
}
