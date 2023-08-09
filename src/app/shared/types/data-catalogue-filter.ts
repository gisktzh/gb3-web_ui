import {DataCatalogueFilterProperty} from '../interfaces/data-catalogue-filter-property.interface';
import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from '../models/overview-metadata-item.model';

/**
 * A map of all available DataCatalogueFilters, where the key is the filter configuration and the value a set of (unique) values for the
 * configuration by which the items can be filtered.
 */
export type DataCatalogueFilter = Map<DataCatalogueFilterProperty, Set<string>>;

export type DataCatalogueFilterKey =
  | keyof DatasetOverviewMetadataItem
  | keyof ProductOverviewMetadataItem
  | keyof MapOverviewMetadataItem
  | keyof ServiceOverviewMetadataItem;
