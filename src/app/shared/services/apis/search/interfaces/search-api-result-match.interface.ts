import {PointWithSrs} from '../../../../interfaces/geojson-types-with-srs.interface';
import {SearchIndexType} from '../../../../configs/search-index.config';

export interface SearchApiResultMatch {
  displayString: string;
  score: number;
  geometry: PointWithSrs;
  indexName?: string;
  indexType?: SearchIndexType;
}
