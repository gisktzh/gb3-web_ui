import {FilterValue} from '../../shared/interfaces/topic.interface';
import {AttributeFilterValue} from '../interfaces/attribute-filter-value.interface';

/**
 * This class combines the currently active attribute filter value `attributeFilterValue` with its corresponding filter configuration `filterValue`
 */
export class ActiveAttributeFilterValue {
  public readonly name: string;
  public readonly filterValue: FilterValue;
  public readonly attributeFilterValue: AttributeFilterValue;

  constructor(filterValue: FilterValue, attributeFilterValue: AttributeFilterValue) {
    this.name = filterValue.name;
    this.filterValue = filterValue;
    this.attributeFilterValue = attributeFilterValue;
  }
}
