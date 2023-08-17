import {PointWithSrs} from '../../../../interfaces/geojson-types-with-srs.interface';
import {SearchIndexType} from '../../../../configs/search-index.config';

export interface SearchResultMatch {
  displayString: string;
  score: number;
  geometry: PointWithSrs;
  indexName?: string;
  indexType?: SearchIndexType;
}
