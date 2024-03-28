import {SearchIndex} from '../services/apis/search/interfaces/search-index.interface';

export type SearchIndexType =
  | 'addresses'
  | 'places'
  | 'gvz'
  | 'parcels'
  | 'egrid'
  | 'egid'
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
    indexName: 'gvz',
    label: 'GVZ-Nummer',
    active: true,
    indexType: 'gvz',
  },
  {
    indexName: 'parznr',
    label: 'Parzellen-, Grundstücks- und Liegenschaftsnummer',
    active: true,
    indexType: 'parcels',
  },
  {
    indexName: 'egrid',
    label: 'Eidgenössische Grundstücksidentifikation (E-GRID)',
    active: true,
    indexType: 'egrid',
  },
  {
    indexName: 'egid',
    label: 'Eidgenössische Gebäudeidentifikator (EGID)',
    active: true,
    indexType: 'egid',
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
