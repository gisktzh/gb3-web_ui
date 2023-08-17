import {SearchConfig} from '../interfaces/search-config.interface';

export const searchConfig: SearchConfig = {
  startPage: {
    searchOptions: {
      faq: true,
      maps: true,
      // TODO WES remove 'addresses'; add other metadata thingies
      searchIndexTypes: ['addresses'],
    },
    resultGroups: [
      {
        label: 'Karten',
        types: ['maps'],
      },
      {
        label: 'Datenkatalog',
        types: ['metadata-maps', 'metadata-datasets', 'metadata-services', 'metadata-products'],
      },
      {
        label: 'Support',
        types: ['faqs'],
      },
    ],
    filterGroups: [
      {
        label: 'Kategorie',
        filters: [
          {label: 'Karten', isActive: false, type: 'maps'},
          {label: 'Metadaten: Karten', isActive: false, type: 'metadata-maps'},
          {label: 'Metadaten: Geodatensätze', isActive: false, type: 'metadata-datasets'},
          {label: 'Metadaten: Geodienste', isActive: false, type: 'metadata-services'},
          {label: 'Metadaten: Produkte', isActive: false, type: 'metadata-products'},
          {label: 'FAQ', isActive: false, type: 'faqs'},
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
    resultGroups: [
      {
        label: 'Orte / Adressen',
        types: ['addresses', 'places'],
      },
      {
        label: 'Objekte',
        types: ['activeMapItems'],
      },
      {
        label: 'Karten',
        types: ['maps'],
      },
    ],
    filterGroups: [{label: 'Kategorie', filters: []}],
  },
};
