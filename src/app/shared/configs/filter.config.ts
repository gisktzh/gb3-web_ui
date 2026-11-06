import {DataCatalogueFilterConfiguration} from '../interfaces/data-catalogue-filter.interface';
import {DataDownloadFilterConfiguration} from '../interfaces/data-download-filter.interface';

export const dataCatalogueFilterConfig: DataCatalogueFilterConfiguration[] = [
  // NOSONAR -- This is an actual todo. // TODO: add ogd.
  {key: 'type', label: 'Kategorie'},
  {key: 'responsibleDepartment', label: 'Datenbereitsteller'},
  {key: 'outputFormat', label: 'Dateiformate'},
];

export const dataDownloadFilterConfig: DataDownloadFilterConfiguration[] = [
  {category: 'availability', label: 'Verfügbarkeit'},
  {category: 'format', label: 'Dateiformate'},
  {category: 'theme', label: 'Themen'},
];
