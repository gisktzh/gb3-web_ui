import {Point} from 'geojson';

export interface SearchResultMatch {
  displayString: string;
  score: number;
  geometry: Point;
  indexName?: string;
}
