import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {SearchApiResponse} from "../interfaces/search-api-response.interface";
import {AddressIndex} from "../interfaces/address-index.interface";
import {SearchWindowElement} from "../interfaces/search-window-element.interface";
import {PlacesIndex} from "../interfaces/places-index.interface";
import {environment} from "../../../../../../environments/environment";
import {Point} from "geojson";
import {BaseApiService} from "../../abstract-api.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SearchService extends BaseApiService {
  protected apiBaseUrl = `${environment.apiConfigs.searchApi.baseUrl}`;

  public searchAddressesAndPlaces(term: string): Observable<SearchWindowElement[]> {
    return this.getElasticsearch('fme-addresses,fme-places', term).pipe(map(
      (response: SearchApiResponse) => this.getAddressAndPlaceSearchResults(response)
    ));
  }

  private getAddressAndPlaceSearchResults(searchResponse: SearchApiResponse): SearchWindowElement[] {
    const addressResults = this.getAddressResults(searchResponse);
    const placesResults = this.getPlacesResults(searchResponse);
    const combinedResults = addressResults.concat(placesResults);
    combinedResults.sort((a, b) => b.score > a.score ? 1 : -1);
    return combinedResults;
  }

  private getAddressResults(searchResponse: SearchApiResponse): SearchWindowElement[] {
    const searchResults: SearchWindowElement[] = [];
    const addressHits = searchResponse.results[0].data.hits.hits;
    for (const hit of addressHits) {
      const hitSource = hit._source as AddressIndex;
      searchResults.push({
        displayString: `${hitSource.street} ${hitSource.no}, ${hitSource.plz} ${hitSource.town}`,
        score: hit._score ?? -99,
        geometry: {'coordinates': hitSource.geometry} as Point
      });
    }
    return searchResults;
  }

  private getPlacesResults(searchResponse: SearchApiResponse): SearchWindowElement[] {
    const searchResults: SearchWindowElement[] = [];
    const placesHits = searchResponse.results[1].data.hits.hits;
    for (const hit of placesHits) {
      const hitSource = hit._source as PlacesIndex;
      searchResults.push({
        displayString: `${hitSource.type} ${hitSource.name}`,
        score: hit._score ?? -99,
        geometry: {'coordinates': hitSource.geometry} as Point
      });
    }
    return searchResults;
  }

  private getElasticsearch(indexes: string, term: string): Observable<SearchApiResponse> {
    const params = [
      {
        'key': 'indexes',
        'value': indexes
      },
      {
        'key': 'term',
        'value': term
      }
    ];
    const requestUrl = this.createFullEndpointUrl('search', params);
    return this.get<SearchApiResponse>(requestUrl);
  }

  private createFullEndpointUrl(endpoint: string, parameters: {key: string; value: string}[] = []): string {
    const url = new URL(`${this.apiBaseUrl}/${endpoint}`);

    if (parameters) {
      parameters.forEach(({key, value}) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }
}
