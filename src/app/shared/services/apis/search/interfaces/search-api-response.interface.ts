import {SearchResult} from "./search-result.interface";
import {AddressIndex} from "./address-index.interface";
import {PlacesIndex} from "./places-index.interface";

export interface SearchApiResponse {
  results: SearchResult<AddressIndex | PlacesIndex>[];
}
