import {SearchWindowElement} from "./search-window-element.interface";

export interface SearchResult {
  index: string;
  matches: SearchWindowElement[];
}
