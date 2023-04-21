import {AvailableIndex} from "../services/apis/search/interfaces/available-index.interface";

export const DEFAULT_SEARCHES: AvailableIndex[] = [
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

export const MAP_SEARCH: AvailableIndex = {
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
