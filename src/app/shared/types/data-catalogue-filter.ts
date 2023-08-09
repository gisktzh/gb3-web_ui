import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from '../models/overview-metadata-item.model';

export type DataCatalogueFilterKey =
  | keyof DatasetOverviewMetadataItem
  | keyof ProductOverviewMetadataItem
  | keyof MapOverviewMetadataItem
  | keyof ServiceOverviewMetadataItem;
