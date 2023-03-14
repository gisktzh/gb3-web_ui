import {FilterConfiguration} from '../../shared/interfaces/topic.interface';
import {AttributeFilter} from '../interfaces/attribute-filter.interface';
import {ActiveAttributeFilterValue} from './active-attribute-filter-value.model';

/**
 * This class combines the currently active attribute filter `attributeFilter` with its corresponding filter configuration `filterConfig`
 */
export class ActiveAttributeFilter {
  public readonly parameter: string;
  public readonly filterConfig: FilterConfiguration;
  public readonly attributeFilter: AttributeFilter;

  public readonly activeAttributeFilterValues: ActiveAttributeFilterValue[];

  constructor(filterConfig: FilterConfiguration, attributeFilter: AttributeFilter) {
    this.parameter = filterConfig.parameter;
    this.filterConfig = filterConfig;
    this.attributeFilter = attributeFilter;

    this.activeAttributeFilterValues = filterConfig.filterValues.map((filterValue) => {
      const attributeFilterValue = attributeFilter.attributeFilterValues.find((mfv) => mfv.name === filterValue.name);
      if (!attributeFilterValue) {
        throw new Error(`Attribute filter value '${filterValue.name}' not found!`); // todo: error handling
      }
      return new ActiveAttributeFilterValue(filterValue, attributeFilterValue);
    });
  }
}
