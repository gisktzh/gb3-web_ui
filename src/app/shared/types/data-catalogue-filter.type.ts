import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from '../models/overview-search-result.model';

export type DataCatalogueFilterKey =
  | keyof DatasetOverviewMetadataItem
  | keyof ProductOverviewMetadataItem
  | keyof MapOverviewMetadataItem
  | keyof ServiceOverviewMetadataItem;
