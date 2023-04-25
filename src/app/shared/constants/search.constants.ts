import {SearchIndex} from "../services/apis/search/interfaces/search-index.interface";

export const DEFAULT_SEARCHES: SearchIndex[] = [
  {
    indexName: 'fme-addresses',
    displayString: 'Adressen',
    active: true
  },
  {
    indexName: 'fme-places',
    displayString: 'Orte',
    active: true
  }
];

export const MAP_SEARCH: SearchIndex = {
  indexName: '',
  displayString: 'Karten',
  active: true
};

export const ACTIVE_SEARCH_INDICES: string[] = [
  "schacht",
  "boje",
  "veloverbindungen",
  "wasserrechtwww",
  "strkm",
  "verkehrsmessstellen",
  "gvz",
  "beleuchtung",
  "gewaesserangaben",
  "fassung",
  "bienenstaende",
  "verkehrstechnik"
];
