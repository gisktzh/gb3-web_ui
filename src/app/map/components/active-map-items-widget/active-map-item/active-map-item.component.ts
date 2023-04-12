import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {TimeExtent} from '../../../interfaces/time-extent.interface';
import {selectActiveMapItems} from '../../../../state/map/reducers/active-map-item.reducer';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss']
})
export class ActiveMapItemComponent implements OnInit, OnDestroy {
  @Output() public showAttributeFilterEvent = new EventEmitter<void>();

  @Input() public activeMapItem!: ActiveMapItem;

  public formattedCurrentOpacity: string = '';
  public numberOfChangedFilters: number = 0;

  private _currentOpacity: number = 0;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);

  public get currentOpacity(): number {
    return this._currentOpacity;
  }

  public set currentOpacity(value: number) {
    this._currentOpacity = value;
    this.formattedCurrentOpacity = this.convertTransparencyToString(value);
  }

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.currentOpacity = this.activeMapItem.opacity;
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public trackByLayerId(index: number, item: MapLayer) {
    return item.id;
  }

  public toggleSublayerVisibility(layer: MapLayer) {
    this.store.dispatch(
      ActiveMapItemActions.setSublayerVisibility({visible: !layer.visible, activeMapItem: this.activeMapItem, layerId: layer.id})
    );
  }

  public dropSublayer($event: CdkDragDrop<CdkDrag>) {
    this.store.dispatch(
      ActiveMapItemActions.reorderSublayer({
        activeMapItem: this.activeMapItem,
        previousPosition: $event.previousIndex,
        currentPosition: $event.currentIndex
      })
    );
  }

  public onOpacitySliderChange(opacity: number) {
    this.store.dispatch(ActiveMapItemActions.setOpacity({opacity, activeMapItem: this.activeMapItem}));
  }

  public onTimeSliderExtentChange(timeExtent: TimeExtent) {
    this.store.dispatch(ActiveMapItemActions.setTimeSliderExtent({timeExtent, activeMapItem: this.activeMapItem}));
  }

  private convertTransparencyToString(value?: number): string {
    return value === undefined ? '' : `${Math.round(value * 100)}%`;
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((activeMapItems) => {
            const currentActiveMapItem = activeMapItems.find((activeMapItem) => activeMapItem.id === this.activeMapItem.id);
            if (currentActiveMapItem && currentActiveMapItem.filterConfigurations) {
              // assumption: every filter is by default not active
              this.numberOfChangedFilters =
                currentActiveMapItem.filterConfigurations
                  .flatMap((filterConfig) => filterConfig.filterValues)
                  .filter((filterValue) => filterValue.isActive).length ?? 0;
            } else {
              this.numberOfChangedFilters = 0;
            }
          })
        )
        .subscribe()
    );
  }
}
