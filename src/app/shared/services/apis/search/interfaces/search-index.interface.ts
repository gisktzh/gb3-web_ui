import {SearchIndexType} from '../../../../configs/search-index.config';

export interface SearchIndex {
  displayString: string;
  indexName: string;
  active: boolean;
  indexType: SearchIndexType;
}
