import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SearchApiResultMatch} from '../interfaces/search-api-result-match.interface';
import {BaseApiService} from '../../abstract-api.service';
import {map} from 'rxjs/operators';
import {SearchApiResult} from '../interfaces/search-api-result.interface';
import {SearchIndex} from '../interfaces/search-index.interface';

@Injectable({
  providedIn: 'root',
})
export class SearchService extends BaseApiService {
  protected apiBaseUrl = this.configService.apiConfig.searchApi.baseUrl;

  public searchIndexes(term: string, searchIndexex: SearchIndex[]): Observable<SearchApiResultMatch[]> {
    const searchIndexNames = searchIndexex.map((index) => index.indexName).toString();
    return this.getElasticsearch(searchIndexNames, term).pipe(
      map((response: SearchApiResult[]) => this.combineSearchResults(response, searchIndexex)),
    );
  }

  private combineSearchResults(searchResponse: SearchApiResult[], indexes: SearchIndex[]): SearchApiResultMatch[] {
    const combinedResults: SearchApiResultMatch[] = [];
    searchResponse.forEach((searchResult) => {
      const indexType = indexes.find((index) => index.indexName === searchResult.index)?.indexType ?? 'unknown';
      searchResult.matches.forEach((match) => {
        match.indexName = this.getIndexTitle(searchResult.index, indexes);
        match.indexType = indexType;
        switch (match.indexType) {
          case 'addresses':
          case 'places':
          case 'activeMapItems':
            match.geometry = {...match.geometry, srs: 4326}; // elastic search always delivers pure GeoJSON with 4326 coordinates
            break;
          case 'metadata-maps':
          case 'metadata-products':
          case 'metadata-datasets':
          case 'metadata-services':
          case 'unknown':
            break;
        }
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

  private getElasticsearch(indexes: string, term: string): Observable<SearchApiResult[]> {
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
    return this.get<SearchApiResult[]>(requestUrl);
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
