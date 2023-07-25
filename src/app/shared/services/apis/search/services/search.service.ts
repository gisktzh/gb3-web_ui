import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SearchResultMatch} from '../interfaces/search-result-match.interface';
import {BaseApiService} from '../../abstract-api.service';
import {map} from 'rxjs/operators';
import {SearchResult} from '../interfaces/search-result.interface';
import {SearchIndex} from '../interfaces/search-index.interface';

@Injectable({
  providedIn: 'root',
})
export class SearchService extends BaseApiService {
  protected apiBaseUrl = this.configService.apiConfig.searchApi.baseUrl;

  public searchIndexes(term: string, indexes: SearchIndex[]): Observable<SearchResultMatch[]> {
    const searchIndexNames = indexes.map((index) => index.indexName).toString();
    return this.getElasticsearch(searchIndexNames, term).pipe(
      map((response: SearchResult[]) => this.combineSearchResults(response, indexes)),
    );
  }

  private combineSearchResults(searchResponse: SearchResult[], indexes: SearchIndex[]): SearchResultMatch[] {
    const combinedResults: SearchResultMatch[] = [];
    searchResponse.forEach((searchResult) => {
      searchResult.matches.forEach((match) => {
        match.indexName = this.getIndexTitle(searchResult.index, indexes);
        match.geometry = {...match.geometry, srs: 4326}; // elastic search always delivers pure GeoJSON with 4326 coordinates
      });
      combinedResults.push(...searchResult.matches);
    });
    combinedResults.sort((a, b) => b.score - a.score);
    return combinedResults;
  }

  private getIndexTitle(indexName: string, indexes: SearchIndex[]): string {
    const fromIndex = indexes.find((index) => index.indexName === indexName);
    if (fromIndex) {
      return fromIndex.displayString;
    }
    return indexName;
  }

  private getElasticsearch(indexes: string, term: string): Observable<SearchResult[]> {
    const params = [
      {
        key: 'indexes',
        value: indexes,
      },
      {
        key: 'term',
        value: term,
      },
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
