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
    displayString: 'Adressen',
    active: true,
    indexType: 'addresses',
  },
  {
    indexName: 'fme-places',
    displayString: 'Orte',
    active: true,
    indexType: 'places',
  },
  {
    indexName: 'meta_gb2karten',
    displayString: 'Karten',
    active: true,
    indexType: 'metadata-maps',
  },
  {
    indexName: 'meta_product',
    displayString: 'Produkte',
    active: true,
    indexType: 'metadata-products',
  },
  {
    indexName: 'meta_geodatensatz',
    displayString: 'Geodatensatz',
    active: true,
    indexType: 'metadata-datasets',
  },
  {
    indexName: 'meta_service',
    displayString: 'Geodienste',
    active: true,
    indexType: 'metadata-services',
  },
];
