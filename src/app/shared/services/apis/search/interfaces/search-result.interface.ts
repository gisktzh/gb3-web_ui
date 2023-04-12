import {SearchResponse} from "elasticsearch";

export interface SearchResult<T> {
  id: string;
  data: SearchResponse<T>;
}
