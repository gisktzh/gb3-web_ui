import {Component, Input, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {MapFilter} from '../../../../interfaces/map-filter';
import {ActiveMapFilter} from '../../../../models/active-filter.model';

@Component({
  selector: 'map-filter',
  templateUrl: './map-filter.component.html',
  styleUrls: ['./map-filter.component.scss']
})
export class MapFilterComponent implements OnInit {
  @Input() public activeMapItem!: ActiveMapItem;

  public activeMapFilters: ActiveMapFilter[] = [];

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    if (this.activeMapItem.filterConfigurations && this.activeMapItem.mapFilters) {
      const mapFilters = this.activeMapItem.mapFilters;
      this.activeMapFilters = this.activeMapItem.filterConfigurations.map((filterConfig) => {
        const mapFilter = mapFilters.find((mf) => mf.parameter === filterConfig.parameter);
        if (!mapFilter) {
          throw new Error(`Map filter for config ${filterConfig.parameter} not found!`); // todo: error handling
        }
        return new ActiveMapFilter(filterConfig, mapFilter);
      });
    }
  }

  public changeFilter(filterConfigParameter: string, filterValueName: string, checked: boolean) {
    if (!this.activeMapItem.mapFilters) {
      return;
    }

    const mapFilters: MapFilter[] = structuredClone(this.activeMapItem.mapFilters);
    const activeFilterValue = mapFilters
      .find((mf) => mf.parameter === filterConfigParameter)
      ?.mapFilterValues.find((fv) => fv.name === filterValueName);
    if (activeFilterValue) {
      activeFilterValue.isActive = !checked;
    }
    this.store.dispatch(ActiveMapItemActions.setMapFilters({mapFilters: mapFilters, activeMapItem: this.activeMapItem}));
  }
}
