import {DataCatalogueFilterKey} from '../types/data-catalogue-filter.type';

/**
 * Represents a filter configuration containing the key (which maps to an OverviewMetadataItem's (or its children's) property) and a
 * label for this given filter.
 */
export interface DataCatalogueFilterConfiguration {
  key: DataCatalogueFilterKey;
  label: string;
}

/**
 * The actual filter which consists of a configuration and the filtervalues, where each value represents the filterable value and its
 * state (active or not active).
 */
export interface DataCatalogueFilter extends DataCatalogueFilterConfiguration {
  filterValues: {
    value: string;
    isActive: boolean;
  }[];
}

/**
 * Represents a list of all values which are active for a given key.
 */
export interface ActiveDataCatalogueFilterGroup {
  key: DataCatalogueFilterKey;
  values: string[];
}

/**
 * Represents an active filter value for a given key.
 */
export interface ActiveDataCatalogueFilter {
  key: DataCatalogueFilterKey;
  value: string;
}
