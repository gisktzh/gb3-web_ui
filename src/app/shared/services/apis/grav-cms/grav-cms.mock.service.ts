import {Injectable} from '@angular/core';
import {delay, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {GravCmsService} from './grav-cms.service';
import {DiscoverMapsItem} from '../../../interfaces/discover-maps-item.interface';
import {PageNotification} from '../../../interfaces/page-notification.interface';
import {FrequentlyUsedItem} from '../../../interfaces/frequently-used-item.interface';
import {discoverMapsMockData, frequentlyUsedMockData, pageInfosMockData} from '../../../models/grav-cms-mock.data';

/**
 * Returns mockdata and mimicks an API request delay between 1ms and 1000ms.
 */
@Injectable({
  providedIn: 'root'
})
export class GravCmsMockService extends GravCmsService {
  protected override apiBaseUrl: string = window.location.origin;

  public override loadDiscoverMapsData(): Observable<DiscoverMapsItem[]> {
    return of(discoverMapsMockData).pipe(
      delay(this.getRandomDelayInMs()),
      map((mockResult) => this.transformDiscoverMapsData(mockResult))
    );
  }

  public override loadPageInfosData(): Observable<PageNotification[]> {
    return of(pageInfosMockData).pipe(
      delay(this.getRandomDelayInMs()),
      map((mockResult) => this.transformPageInfosData(mockResult))
    );
  }

  public override loadFrequentlyUsedData(): Observable<FrequentlyUsedItem[]> {
    return of(frequentlyUsedMockData).pipe(
      delay(this.getRandomDelayInMs()),
      map((mockResult) => this.transformFrequentlyUsedData(mockResult))
    );
  }

  private getRandomDelayInMs(): number {
    return Math.floor(Math.random() * 1000);
  }
}
