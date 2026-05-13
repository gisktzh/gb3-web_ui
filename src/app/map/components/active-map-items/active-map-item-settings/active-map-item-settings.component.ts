import {Component, computed, effect, inject, input, linkedSignal} from '@angular/core';
import {Store} from '@ngrx/store';
import {isActiveMapItemOfType} from '../../../../shared/type-guards/active-map-item-type.type-guard';
import {NumberUtils} from '../../../../shared/utils/number.utils';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {MapAttributeFiltersItemActions} from '../../../../state/map/actions/map-attribute-filters-item.actions';
import {TimeExtent} from '../../../interfaces/time-extent.interface';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../../models/implementations/gb2-wms.model';
import {selectItems} from '../../../../state/map/selectors/active-map-items.selector';
import {SliderWrapperComponent} from '../../../../shared/components/slider-wrapper/slider-wrapper.component';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {FormsModule} from '@angular/forms';
import {MatDivider} from '@angular/material/divider';
import {TimeSliderComponent} from '../../time-slider/time-slider.component';
import {MatBadge} from '@angular/material/badge';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'active-map-item-settings',
  templateUrl: './active-map-item-settings.component.html',
  styleUrls: ['./active-map-item-settings.component.scss'],
  imports: [SliderWrapperComponent, MatSlider, MatSliderThumb, FormsModule, MatDivider, TimeSliderComponent, MatBadge, MatButton, MatIcon],
})
export class ActiveMapItemSettingsComponent {
  private readonly store = inject(Store);

  public readonly activeMapItem = input.required<ActiveMapItem>();
  private readonly activeMapItems = this.store.selectSignal(selectItems);
  public readonly currentOpacity = linkedSignal(() => this.activeMapItem().opacity || 0);
  public readonly formattedCurrentOpacity = computed(() => this.convertTransparencyToString(this.currentOpacity()));
  public readonly numberOfChangedFilters = computed(() => {
    let numberOfChangedFilters = 0;
    const activeGb2WmsMapItems: Gb2WmsActiveMapItem[] = this.activeMapItems().filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
    const activeMapItem = activeGb2WmsMapItems.find((mapItem) => mapItem.id === this.activeMapItem().id);

    if (activeMapItem?.settings.filterConfigurations) {
      // assumption: every filter is not active by default => only count active filters
      numberOfChangedFilters = activeMapItem.settings.filterConfigurations
        .flatMap((filterConfig) => filterConfig.filterValues)
        .filter((filterValue) => filterValue.isActive).length;
    }

    return numberOfChangedFilters;
  });
  public readonly gb2WmsActiveMapItemWithTimeslider = computed<Gb2WmsActiveMapItem | null>(() => {
    const activeMapItem = this.activeMapItem();

    return activeMapItem.settings.type === 'gb2Wms' &&
      activeMapItem.settings.timeSliderConfiguration &&
      activeMapItem.settings.timeSliderExtent
      ? (activeMapItem as Gb2WmsActiveMapItem)
      : null;
  });
  public readonly hasAttributeFilter = computed(() => {
    const activeMapItemSettings = this.activeMapItem().settings;
    return activeMapItemSettings.type === 'gb2Wms' && activeMapItemSettings.filterConfigurations;
  });

  constructor() {
    effect(() => {
      this.store.dispatch(ActiveMapItemActions.setOpacity({opacity: this.currentOpacity(), activeMapItem: this.activeMapItem()}));
    });
  }

  public onTimeSliderExtentChange(timeExtent: TimeExtent) {
    this.store.dispatch(
      ActiveMapItemActions.setTimeSliderExtent({
        timeExtent,
        activeMapItem: this.activeMapItem() as Gb2WmsActiveMapItem,
      }),
    );
  }

  public showMapAttributeFilters() {
    this.store.dispatch(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId(this.activeMapItem()));
  }

  private convertTransparencyToString(value?: number): string {
    return value === undefined ? '' : `${NumberUtils.roundToDecimals(value * 100)}%`;
  }
}
