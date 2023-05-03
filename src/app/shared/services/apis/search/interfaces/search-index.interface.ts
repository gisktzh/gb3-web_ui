import {SearchIndexType} from '../../../../types/search-index-type';

export interface SearchIndex {
  displayString: string;
  indexName: string;
  active: boolean;
  indexType: SearchIndexType;
}
