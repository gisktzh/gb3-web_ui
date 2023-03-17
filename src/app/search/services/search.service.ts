import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from "rxjs";
import {SearchApiResponse} from "../interfaces/search-api-response.interface";

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private endpoint = 'http://localhost:8000/search';

  constructor(private http: HttpClient) { }

  public search(index: string, term: string): Observable<SearchApiResponse> {
    const params = new HttpParams()
      .set('indexes', index)
      .set('term', term);
    const result = this.http.get(this.endpoint, { params });
    return result as Observable<SearchApiResponse>;
  }
}
