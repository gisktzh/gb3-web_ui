import {AttributeFilterValue} from './attribute-filter-value.interface';

export interface AttributeFilter {
  parameter: string;
  attributeFilterValues: AttributeFilterValue[];
}
