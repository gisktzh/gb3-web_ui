import {Point} from "geojson";

export interface SearchWindowElement {
  displayString: string;
  score: number;
  geometry: Point;
}
