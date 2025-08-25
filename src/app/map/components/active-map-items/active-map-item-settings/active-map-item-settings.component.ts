import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {filter, map, Subscription, tap} from 'rxjs';
import {isActiveMapItemOfType} from '../../../../shared/type-guards/active-map-item-type.type-guard';
import {NumberUtils} from '../../../../shared/utils/number.utils';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {MapAttributeFiltersItemActions} from '../../../../state/map/actions/map-attribute-filters-item.actions';
import {TimeExtent} from '../../../interfaces/time-extent.interface';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../../models/implementations/gb2-wms.model';
import {selectItems} from '../../../../state/map/selectors/active-map-items.selector';

@Component({
  selector: 'active-map-item-settings',
  templateUrl: './active-map-item-settings.component.html',
  styleUrls: ['./active-map-item-settings.component.scss'],
  standalone: false,
})
export class ActiveMapItemSettingsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public activeMapItem!: ActiveMapItem;

  public formattedCurrentOpacity: string = '';
  public numberOfChangedFilters: number = 0;
  public currentOpacity: number = 0;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeMapItems$ = this.store.select(selectItems);

  public ngOnInit(): void {
    this.currentOpacity = this.activeMapItem.opacity;
    this.formattedCurrentOpacity = this.convertTransparencyToString(this.currentOpacity);
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public updateFormattedCurrentOpacity() {
    this.formattedCurrentOpacity = this.convertTransparencyToString(this.currentOpacity);
  }

  public onOpacitySliderChange(opacity: number) {
    this.store.dispatch(ActiveMapItemActions.setOpacity({opacity, activeMapItem: this.activeMapItem}));
  }

  public onTimeSliderExtentChange(timeExtent: TimeExtent) {
    this.store.dispatch(
      ActiveMapItemActions.setTimeSliderExtent({
        timeExtent,
        activeMapItem: this.activeMapItem as Gb2WmsActiveMapItem,
      }),
    );
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
          map((m) => m.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))),
          tap((activeMapItems) => {
            // calculate the number of active filters to display them as badge
            let numberOfChangedFilters = 0;
            const activeMapItem = activeMapItems.find((mapItem) => mapItem.id === this.activeMapItem.id);
            if (activeMapItem?.settings.filterConfigurations) {
              // assumption: every filter is not active by default => only count active filters
              numberOfChangedFilters = activeMapItem.settings.filterConfigurations
                .flatMap((filterConfig) => filterConfig.filterValues)
                .filter((filterValue) => filterValue.isActive).length;
            }
            this.numberOfChangedFilters = numberOfChangedFilters;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          map((activeMapItems) => activeMapItems.find((activeMapItem) => activeMapItem.id === this.activeMapItem.id)),
          filter((activeMapItem) => activeMapItem !== undefined),
          tap((activeMapItem) => (this.currentOpacity = activeMapItem!.opacity)),
        )
        .subscribe(),
    );
  }
}
