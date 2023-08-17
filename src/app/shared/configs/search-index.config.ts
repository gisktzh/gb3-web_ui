import {SearchIndex} from '../services/apis/search/interfaces/search-index.interface';

export type SearchIndexType =
  | 'addresses'
  | 'places'
  | 'activeMapItems'
  | 'metadata-maps'
  | 'metadata-products'
  | 'metadata-datasets'
  | 'metadata-services';

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
];
