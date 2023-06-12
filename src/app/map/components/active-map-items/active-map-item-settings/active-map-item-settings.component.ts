import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {Subscription, tap} from 'rxjs';
import {selectActiveMapItems} from '../../../../state/map/reducers/active-map-item.reducer';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {TimeExtent} from '../../../interfaces/time-extent.interface';
import {MapAttributeFiltersItemActions} from '../../../../state/map/actions/map-attribute-filters-item.actions';
import {NumberUtils} from '../../../../shared/utils/number.utils';

@Component({
  selector: 'active-map-item-settings',
  templateUrl: './active-map-item-settings.component.html',
  styleUrls: ['./active-map-item-settings.component.scss']
})
export class ActiveMapItemSettingsComponent implements OnInit, OnDestroy {
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

  public onOpacitySliderChange(opacity: number) {
    this.store.dispatch(ActiveMapItemActions.setOpacity({opacity, activeMapItem: this.activeMapItem}));
  }

  public onTimeSliderExtentChange(timeExtent: TimeExtent) {
    this.store.dispatch(ActiveMapItemActions.setTimeSliderExtent({timeExtent, activeMapItem: this.activeMapItem}));
  }

  public showMapAttributeFilters() {
    this.store.dispatch(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId(this.activeMapItem));
  }

  private convertTransparencyToString(value?: number): string {
    return value === undefined ? '' : `${NumberUtils.roundToDecimals(value * 100)}%`;
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((activeMapItems) => {
            // calculate the number of active filters to display them as badge
            let numberOfChangedFilters = 0;
            const activeMapItem = activeMapItems.find((mapItem) => mapItem.id === this.activeMapItem.id);
            if (activeMapItem && activeMapItem.filterConfigurations) {
              // assumption: every filter is not active by default => only count active filters
              numberOfChangedFilters = activeMapItem.filterConfigurations
                .flatMap((filterConfig) => filterConfig.filterValues)
                .filter((filterValue) => filterValue.isActive).length;
            }
            this.numberOfChangedFilters = numberOfChangedFilters;
          })
        )
        .subscribe()
    );
  }
}
