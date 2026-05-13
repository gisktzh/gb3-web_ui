import {Component, effect, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapAttributeFiltersItemActions} from '../../../state/map/actions/map-attribute-filters-item.actions';
import {SharedModule} from '../../../shared/shared.module';

import {selectMapAttributeFiltersItem} from '../../../state/map/selectors/map-attribute-filters-item.selector';

@Component({
  selector: 'map-attribute-filter',
  templateUrl: './map-attribute-filter.component.html',
  styleUrls: ['./map-attribute-filter.component.scss'],
  imports: [SharedModule],
})
export class MapAttributeFilterComponent {
  private readonly store = inject(Store);

  public readonly mapAttributeFiltersItem = this.store.selectSignal(selectMapAttributeFiltersItem);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  constructor() {
    effect(() => {
      if (!this.mapAttributeFiltersItem()) {
        this.clearMapAttributeFiltersItemId();
      }
    });
  }

  public clearMapAttributeFiltersItemId() {
    this.store.dispatch(MapAttributeFiltersItemActions.clearMapAttributeFiltersItemId());
  }

  public updateFilter(filterConfigParameter: string, filterValueName: string, checked: boolean) {
    const mapAttributeFiltersItem = this.mapAttributeFiltersItem();
    if (mapAttributeFiltersItem) {
      this.store.dispatch(
        ActiveMapItemActions.setAttributeFilterValueState({
          isFilterValueActive: !checked, // not checked means the filter is active
          filterValueName: filterValueName,
          attributeFilterParameter: filterConfigParameter,
          activeMapItem: mapAttributeFiltersItem,
        }),
      );
    }
  }
}
