import {DataCatalogueFilterKey} from '../types/data-catalogue-filter';

export interface DataCatalogueFilterProperty {
  key: DataCatalogueFilterKey;
  label: string;
}

export interface DataCatalogueFilter {
  key: DataCatalogueFilterKey;
  label: string;
  filterValues: {
    value: string;
    isActive: boolean;
  }[];
}

export interface ActiveDataCatalogueFilterGroup {
  key: DataCatalogueFilterKey;
  values: string[];
}

export interface ActiveDataCatalogueFilter {
  key: DataCatalogueFilterKey;
  value: string;
}
