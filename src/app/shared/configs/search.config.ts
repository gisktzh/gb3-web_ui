import {SearchConfig} from '../interfaces/search-config.interface';

export const searchConfig: SearchConfig = {
  startPage: {
    searchOptions: {
      faq: true,
      maps: true,
      searchIndexTypes: ['metadata-maps', 'metadata-datasets', 'metadata-services', 'metadata-products'],
    },
    filterGroups: [
      {
        label: 'Kategorie',
        useDynamicActiveMapItemsFilter: false,
        filters: [
          {label: 'Karten', isActive: false, type: 'maps'},
          {label: 'Metadaten: Karten', isActive: false, type: 'metadata-maps'},
          {label: 'Metadaten: Geodatensätze', isActive: false, type: 'metadata-datasets'},
          {label: 'Metadaten: Geodienste', isActive: false, type: 'metadata-services'},
          {label: 'Metadaten: Produkte', isActive: false, type: 'metadata-products'},
          {label: 'Häufige Fragen', isActive: false, type: 'faqs'},
          {label: 'Hilfreiche Informationen', isActive: false, type: 'usefulLinks'},
        ],
      },
    ],
  },
  mapPage: {
    searchOptions: {
      faq: false,
      maps: true,
      searchIndexTypes: ['addresses', 'places', 'activeMapItems'],
    },
    filterGroups: [
      {
        label: 'Kategorie',
        useDynamicActiveMapItemsFilter: false,
        filters: [
          {label: 'Adressen', isActive: false, type: 'addresses'},
          {label: 'Orte', isActive: false, type: 'places'},
          {label: 'Karten', isActive: false, type: 'maps'},
        ],
      },
      {label: 'Aktive Karten', useDynamicActiveMapItemsFilter: true, filters: []},
    ],
  },
  dataCatalogPage: {
    searchOptions: {
      faq: false,
      maps: false,
      searchIndexTypes: ['metadata-maps', 'metadata-datasets', 'metadata-services', 'metadata-products'],
    },
    filterGroups: [
      // filters in the data catalog are handled differently
    ],
  },
};
