import {Injectable} from '@angular/core';
import {News} from '../../../interfaces/news.interface';
import {delay, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {KTZHNewsService} from './ktzhnews.service';
import {ktzhNewsDataMock} from '../../../data/ktzh-news-data.mock';

@Injectable({
  providedIn: 'root',
})
export class KTZHNewsServiceMock extends KTZHNewsService {
  /**
   * Returns mockdata and mimicks an API request delay between 1ms and 1000ms.
   */
  public override loadNews(): Observable<News[]> {
    return of(ktzhNewsDataMock).pipe(
      delay(this.getRandomDelayInMs()),
      map((mockResult) => this.transformNewsResult(mockResult)),
    );
  }

  private getRandomDelayInMs(): number {
    return Math.floor(Math.random() * 1000);
  }
}
