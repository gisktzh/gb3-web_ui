import {Injectable} from '@angular/core';
import {KTZHNews} from '../../../interfaces/ktzh-news.interface';
import {delay, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {KTZHNewsService} from './ktzhnews.service';
import {mockData} from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class KTZHNewsMockService extends KTZHNewsService {
  /**
   * Returns mockdata and mimicks an API request delay between 1ms and 1000ms.
   */
  public override loadNews(): Observable<KTZHNews[]> {
    return of(mockData).pipe(
      delay(this.getRandomDelayInMs()),
      map((mockResult) => this.transformNewsResult(mockResult))
    );
  }

  private getRandomDelayInMs(): number {
    return Math.floor(Math.random() * 1000);
  }
}
