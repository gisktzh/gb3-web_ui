import {isPlatformBrowser} from '@angular/common';
import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {News} from '../../../interfaces/news.interface';
import {delay, map} from 'rxjs';
import {Observable, of} from 'rxjs';
import {KTZHNewsService} from './ktzhnews.service';
import {ktzhNewsDataMock} from '../../../data/ktzh-news-data.mock';

@Injectable({
  providedIn: 'root',
})
export class KTZHNewsServiceMock extends KTZHNewsService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Returns mock data and mimics an API request delay in the browser. SSR resolves synchronously so the news is present in the response.
   */
  public override loadNews(): Observable<News[]> {
    const news = of(ktzhNewsDataMock).pipe(map((mockResult) => this.transformNewsResult(mockResult)));

    return this.isBrowser ? news.pipe(delay(this.getRandomDelayInMs())) : news;
  }

  private getRandomDelayInMs(): number {
    return Math.floor(Math.random() * 1000);
  }
}
