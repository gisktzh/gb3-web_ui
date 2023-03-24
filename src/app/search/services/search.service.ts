import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {first, Observable} from "rxjs";
import {SearchApiResponse} from "../interfaces/search-api-response.interface";
import {AddressIndex} from "../interfaces/address-index.interface";
import {SearchWindowElement} from "../interfaces/search-window-element.interface";
import {PlacesIndex} from "../interfaces/places-index.interface";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private endpoint = 'http://localhost:8000/search';

  constructor(private http: HttpClient) { }

  public async addressAndPlacesSearch(term: string): Promise<SearchWindowElement[]> {
    const searchResults: SearchWindowElement[] = [];
    await this.elasticsearch('fme-addresses,fme-places', term).pipe(first()).subscribe(
      (response: SearchApiResponse) => {
        const addressHits = response.results[0].data.hits.hits;
        if (addressHits.length > 0) {
          for (const hit of addressHits) {
            const hitSource = hit._source as AddressIndex;
            searchResults.push(<SearchWindowElement>{
              displayString: `${hitSource.street} ${hitSource.no}, ${hitSource.plz} ${hitSource.town}`,
              score: hit._score,
              geometry: hitSource.geometry
            });
          }
        }
        const placesHits = response.results[1].data.hits.hits;
        if (placesHits.length > 0) {
          for (const hit of placesHits) {
            const hitSource = hit._source as PlacesIndex;
            searchResults.push(<SearchWindowElement>{
              displayString: `${hitSource.TYPE} ${hitSource.NAME}`,
              score: hit._score,
              geometry: hitSource.geometry
            });
          }
        }
        searchResults.sort((a, b) => b.score > a.score ? 1 : -1);
      }
    );
    return searchResults;
  }

  private elasticsearch(indexes: string, term: string): Observable<SearchApiResponse> {
    const params = new HttpParams()
      .set('indexes', indexes)
      .set('term', term);
    const result = this.http.get(this.endpoint, { params });
    return result as Observable<SearchApiResponse>;
  }
}
