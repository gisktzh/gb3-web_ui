import {DataCatalogueFilterConfiguration} from '../interfaces/data-catalogue-filter.interface';

// TODO WES rename? integrate?
export const dataCatalogueFilterConfig: DataCatalogueFilterConfiguration[] = [
  // todo: add ogd
  {key: 'type', label: 'Kategorie'},
  {key: 'responsibleDepartment', label: 'Datenbereitsteller'},
  {key: 'outputFormat', label: 'Dateiformate'},
];
