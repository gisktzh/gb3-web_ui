import {SearchIndex} from '../services/apis/search/interfaces/search-index.interface';

export type SearchIndexType =
  | 'addresses'
  | 'places'
  | 'activeMapItems'
  | 'metadata-maps'
  | 'metadata-products'
  | 'metadata-datasets'
  | 'metadata-services'
  | 'unknown';

export const searchIndexConfig: SearchIndex[] = [
  {
    indexName: 'fme-addresses',
    label: 'Adressen',
    active: true,
    indexType: 'addresses',
  },
  {
    indexName: 'fme-places',
    label: 'Orte',
    active: true,
    indexType: 'places',
  },
  {
    indexName: 'meta_gb2karten',
    label: 'Karten',
    active: true,
    indexType: 'metadata-maps',
  },
  {
    indexName: 'meta_product',
    label: 'Produkte',
    active: true,
    indexType: 'metadata-products',
  },
  {
    indexName: 'meta_geodatensatz',
    label: 'Geodatensatz',
    active: true,
    indexType: 'metadata-datasets',
  },
  {
    indexName: 'meta_service',
    label: 'Geodienste',
    active: true,
    indexType: 'metadata-services',
  },
];
