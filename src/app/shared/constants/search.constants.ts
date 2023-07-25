import {SearchIndex} from '../services/apis/search/interfaces/search-index.interface';

export const DEFAULT_SEARCHES: SearchIndex[] = [
  {
    indexName: 'fme-addresses',
    displayString: 'Adressen',
    active: true,
    indexType: 'default',
  },
  {
    indexName: 'fme-places',
    displayString: 'Orte',
    active: true,
    indexType: 'default',
  },
];

export const MAP_SEARCH: SearchIndex = {
  indexName: '',
  displayString: 'Karten',
  active: true,
  indexType: 'map',
};

export const ACTIVE_SEARCH_INDICES: string[] = [
  'schacht',
  'boje',
  'veloverbindungen',
  'wasserrechtwww',
  'strkm',
  'verkehrsmessstellen',
  'gvz',
  'beleuchtung',
  'gewaesserangaben',
  'fassung',
  'bienenstaende',
  'verkehrstechnik',
];
