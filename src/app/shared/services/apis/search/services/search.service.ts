import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {SearchWindowElement} from "../interfaces/search-window-element.interface";
import {environment} from "../../../../../../environments/environment";
import {BaseApiService} from "../../abstract-api.service";
import {map} from "rxjs/operators";
import {SearchResult} from "../interfaces/search-result.interface";
import {AvailableIndex} from "../interfaces/available-index.interface";

@Injectable({
  providedIn: 'root'
})
export class SearchService extends BaseApiService {
  protected apiBaseUrl = `${environment.apiConfigs.searchApi.baseUrl}`;

  public searchIndexes(term: string, indexes: AvailableIndex[]): Observable<SearchWindowElement[]> {
    return this.getElasticsearch(indexes.map(index => index.indexName).toString(), term).pipe(map(
      (response: SearchResult[]) => this.combineSearchResults(response, indexes)
    ));
  }

  private combineSearchResults(searchResponse: SearchResult[], indexes: AvailableIndex[]): SearchWindowElement[] {
    let combinedResults: SearchWindowElement[] = [];
    for (const searchResult of searchResponse) {
      for (const match of searchResult.matches) {
        match.indexName = this.getIndexTitle(searchResult.index, indexes);
      }
      combinedResults = combinedResults.concat(searchResult.matches);
    }
    combinedResults.sort((a, b) => b.score > a.score ? 1 : -1);
    return combinedResults;
  }

  private getIndexTitle(indexName: string, indexes: AvailableIndex[]): string {
    const fromIndex = indexes.find(index => index.indexName === indexName);
    if (fromIndex) {
      return fromIndex.displayString;
    }
    return 'Unknown';
  }

  private getElasticsearch(indexes: string, term: string): Observable<SearchResult[]> {
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
    return this.get<SearchResult[]>(requestUrl);
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
