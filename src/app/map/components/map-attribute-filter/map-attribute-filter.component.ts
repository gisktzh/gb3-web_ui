import {Component, Input, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {AttributeFilter} from '../../interfaces/attribute-filter.interface';
import {ActiveAttributeFilter} from '../../models/active-attribute-filter.model';

@Component({
  selector: 'map-attribute-filter',
  templateUrl: './map-attribute-filter.component.html',
  styleUrls: ['./map-attribute-filter.component.scss']
})
export class MapAttributeFilterComponent implements OnInit {
  @Input() public activeMapItem!: ActiveMapItem;

  public activeAttributeFilters: ActiveAttributeFilter[] = [];

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    if (this.activeMapItem.filterConfigurations && this.activeMapItem.attributeFilters) {
      const attributeFilters = this.activeMapItem.attributeFilters;
      this.activeAttributeFilters = this.activeMapItem.filterConfigurations.map((filterConfig) => {
        const attributeFilter = attributeFilters.find((mf) => mf.parameter === filterConfig.parameter);
        if (!attributeFilter) {
          throw new Error(`Attribute filter parameter '${filterConfig.parameter}' not found!`); // todo: error handling
        }
        return new ActiveAttributeFilter(filterConfig, attributeFilter);
      });
    }
  }

  public changeFilter(filterConfigParameter: string, filterValueName: string, checked: boolean) {
    if (!this.activeMapItem.attributeFilters) {
      return;
    }

    const attributeFilters: AttributeFilter[] = structuredClone(this.activeMapItem.attributeFilters);
    const attributeFilterValue = attributeFilters
      .find((mf) => mf.parameter === filterConfigParameter)
      ?.attributeFilterValues.find((fv) => fv.name === filterValueName);
    if (attributeFilterValue) {
      attributeFilterValue.isActive = !checked;
    }
    this.store.dispatch(ActiveMapItemActions.setAttributeFilters({attributeFilters: attributeFilters, activeMapItem: this.activeMapItem}));
  }
}
