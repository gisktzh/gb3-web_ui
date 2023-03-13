import {FilterValue} from '../../shared/interfaces/topic.interface';
import {MapFilterValue} from '../interfaces/map-filter-value.interface';

export class ActiveMapFilterValue {
  public readonly name: string;
  public readonly filterValue: FilterValue;
  public readonly mapFilterValue: MapFilterValue;

  constructor(filterValue: FilterValue, mapFilterValue: MapFilterValue) {
    this.name = filterValue.name;
    this.filterValue = filterValue;
    this.mapFilterValue = mapFilterValue;
  }
}
