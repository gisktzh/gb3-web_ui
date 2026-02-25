import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SearchApiResultMatch} from '../interfaces/search-api-result-match.interface';
import {BaseApiService} from '../../abstract-api.service';
import {SearchApiResult} from '../interfaces/search-api-result.interface';
import {SearchIndex} from '../interfaces/search-index.interface';
import {map} from 'rxjs';
import {
  isGeometrySearchApiResultMatch,
  isMetadataSearchApiResultMatch,
} from 'src/app/shared/type-guards/search-api-result-match.type-guard';

@Injectable({
  providedIn: 'root',
})
export class SearchService extends BaseApiService {
  protected apiBaseUrl = `${this.configService.apiConfig.gb2Api.baseUrl}/${this.configService.apiConfig.gb2Api.version}`;

  public searchIndexes(term: string, searchIndexes: SearchIndex[]): Observable<SearchApiResultMatch[]> {
    const searchIndexNames = searchIndexes.map((index) => index.indexName).toString();
    return this.getElasticsearch(searchIndexNames, term).pipe(
      map((response: SearchApiResult[]) => this.combineSearchResults(response, searchIndexes)),
    );
  }

  private combineSearchResults(searchResponse: SearchApiResult[], indexes: SearchIndex[]): SearchApiResultMatch[] {
    const combinedResults: SearchApiResultMatch[] = [];
    searchResponse.forEach((searchResult) => {
      const indexType = indexes.find((index) => index.indexName === searchResult.index)?.indexType ?? 'unknown';
      combinedResults.push(
        ...searchResult.matches.map((match): SearchApiResultMatch => {
          const indexName = this.getIndexTitle(searchResult.index, indexes);
          if (isGeometrySearchApiResultMatch(match)) {
            return {
              ...match,
              indexType: indexType as 'addresses' | 'places' | 'activeMapItems' | 'gvz' | 'egrid' | 'egid' | 'parcels',
              indexName,
              geometry: {srs: 4326, ...match.geometry},
            };
          }

          if (isMetadataSearchApiResultMatch(match)) {
            return {
              ...match,
              indexType: indexType as 'metadata-maps' | 'metadata-products' | 'metadata-datasets' | 'metadata-services',
              indexName,
            };
          }

          return {
            ...match,
            indexType: indexType as 'unknown',
            indexName,
          };
        }),
      );
    });
    combinedResults.sort((a, b) => b.score - a.score);

    return combinedResults;
  }

  private getIndexTitle(indexName: string, indexes: SearchIndex[]): string {
    const fromIndex = indexes.find((index) => index.indexName === indexName);
    if (fromIndex) {
      return fromIndex.label;
    }
    return indexName;
  }

  private getElasticsearch(indexes: string, term: string): Observable<SearchApiResult[]> {
    if (term.trim() === '') {
      return of([]);
    }

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
