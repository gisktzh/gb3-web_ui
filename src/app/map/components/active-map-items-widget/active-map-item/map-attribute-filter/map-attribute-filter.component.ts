import {Component, Input, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {AttributeFilter, AttributeFilterConfiguration} from '../../../../../shared/interfaces/topic.interface';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {MapFilter} from '../../../../interfaces/map-filter';
import {ActiveMapFilter} from '../../../../models/active-filter.model';

@Component({
  selector: 'map-attribute-filter',
  templateUrl: './map-attribute-filter.component.html',
  styleUrls: ['./map-attribute-filter.component.scss']
})
export class MapAttributeFilterComponent implements OnInit {
  @Input() public activeMapItem!: ActiveMapItem;

  public activeMapFilters: ActiveMapFilter[] = [];

  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    if (this.activeMapItem.filterConfigurations && this.activeMapItem.mapFilters) {
      const mapFilters = this.activeMapItem.mapFilters;
      const activeMapFilters: ActiveMapFilter[] = [];
      this.activeMapItem.filterConfigurations.forEach((filterConfig) => {
        const mapFilter = mapFilters.find((mf) => mf.parameter === filterConfig.parameter);
        if (mapFilter) {
          activeMapFilters.push(new ActiveMapFilter(filterConfig, mapFilter));
        }
      });
      this.activeMapFilters = activeMapFilters;
    }
  }

  public changeFilter(filterConfig: AttributeFilterConfiguration, filterValue: AttributeFilter, checked: boolean) {
    if (!this.activeMapItem.mapFilters) {
      return;
    }

    const mapFilters: MapFilter[] = structuredClone(this.activeMapItem.mapFilters);
    const activeFilterValue = mapFilters
      .find((mf) => mf.parameter === filterConfig.parameter)
      ?.filterValues.find((fv) => fv.name === filterValue.name);
    if (activeFilterValue) {
      activeFilterValue.isActive = !checked;
    }
    this.store.dispatch(ActiveMapItemActions.setMapFilters({mapFilters: mapFilters, activeMapItem: this.activeMapItem}));
  }
}
