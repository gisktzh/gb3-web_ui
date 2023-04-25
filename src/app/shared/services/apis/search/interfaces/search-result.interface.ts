import {SearchResultMatch} from "./search-result-match.interface";

export interface SearchResult {
  index: string;
  matches: SearchResultMatch[];
}
