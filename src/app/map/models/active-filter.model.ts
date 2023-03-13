import {FilterConfiguration} from '../../shared/interfaces/topic.interface';
import {MapFilter} from '../interfaces/map-filter';
import {ActiveMapFilterValue} from './active-map-filter-value.model';

export class ActiveMapFilter {
  public readonly parameter: string;
  public readonly filterConfig: FilterConfiguration;
  public readonly mapFilter: MapFilter;

  public readonly activeMapFilterValues: ActiveMapFilterValue[];

  constructor(filterConfig: FilterConfiguration, mapFilter: MapFilter) {
    this.parameter = filterConfig.parameter;
    this.filterConfig = filterConfig;
    this.mapFilter = mapFilter;
    this.activeMapFilterValues = filterConfig.filterValues.map((filterValue) => {
      const mapFilterValue = mapFilter.mapFilterValues.find((mfv) => mfv.name === filterValue.name);
      if (!mapFilterValue) {
        throw new Error(`Map filter value for value ${filterValue.name} not found!`); // todo: error handling
      }
      return new ActiveMapFilterValue(filterValue, mapFilterValue);
    });
  }
}
