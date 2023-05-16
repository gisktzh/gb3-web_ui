import {PointWithSrs} from '../../../../interfaces/geojson-types-with-srs.interface';

export interface SearchResultMatch {
  displayString: string;
  score: number;
  geometry: PointWithSrs;
  indexName?: string;
}
