import {SearchIndexType} from '../../../../configs/search-index.config';

export interface SearchIndex {
  label: string;
  indexName: string;
  active: boolean;
  indexType: SearchIndexType;
}
