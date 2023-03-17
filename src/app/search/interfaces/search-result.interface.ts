import {SearchResponse} from "@elastic/elasticsearch/lib/api/types";

export interface SearchResult {
  id: string;
  data: SearchResponse;
}
