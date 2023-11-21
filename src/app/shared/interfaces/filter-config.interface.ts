import {DataCatalogueFilterConfiguration} from './data-catalogue-filter.interface';
import {DataDownloadFilterConfiguration} from './data-download-filter.interface';

export interface FilterConfig {
  dataCatalogue: DataCatalogueFilterConfiguration[];
  dataDownload: DataDownloadFilterConfiguration[];
}
