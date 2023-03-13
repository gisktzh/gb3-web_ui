import {AttributeFilterConfiguration} from '../../shared/interfaces/topic.interface';
import {MapFilter} from '../interfaces/map-filter';

export class ActiveMapFilter {
  public readonly filterConfig: AttributeFilterConfiguration;
  public readonly mapFilter: MapFilter;

  constructor(filterConfig: AttributeFilterConfiguration, mapFilter: MapFilter) {
    this.filterConfig = filterConfig;
    this.mapFilter = mapFilter;
  }
}
