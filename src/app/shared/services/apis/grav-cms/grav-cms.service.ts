import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {map, Observable} from 'rxjs';
import {DiscoverMapsItem} from '../../../interfaces/discover-maps-item.interface';
import {DiscoverMapsRoot, FrequentlyUsedRoot, PageInfosRoot, Pages} from '../../../models/grav-cms-generated.interfaces';
import {PageNotification, PageNotificationSeverity} from '../../../interfaces/page-notification.interface';
import {MainPage} from '../../../enums/main-page.enum';
import {FrequentlyUsedItem} from '../../../interfaces/frequently-used-item.interface';

const DATE_FORMAT = 'DD.MM.YYYY';

@Injectable({
  providedIn: 'root',
})
export class GravCmsService extends BaseApiService {
  protected apiBaseUrl: string = this.configService.apiConfig.gravCms.baseUrl;
  private readonly discoverMapsEndpoint: string = 'discovermaps.json';
  private readonly pageInfosEndpoint: string = 'pageinfos.json';
  private readonly frequentlyUsedItemsEndpoint: string = 'frequentlyused.json';

  public loadDiscoverMapsData(): Observable<DiscoverMapsItem[]> {
    const requestUrl = this.createFullEndpointUrl(this.discoverMapsEndpoint);
    return this.get<DiscoverMapsRoot>(requestUrl).pipe(map((response) => this.transformDiscoverMapsData(response)));
  }

  public loadPageInfosData(): Observable<PageNotification[]> {
    const requestUrl = this.createFullEndpointUrl(this.pageInfosEndpoint);
    return this.get<PageInfosRoot>(requestUrl).pipe(map((response) => this.transformPageInfosData(response)));
  }

  public loadFrequentlyUsedData(): Observable<FrequentlyUsedItem[]> {
    const requestUrl = this.createFullEndpointUrl(this.frequentlyUsedItemsEndpoint);
    return this.get<FrequentlyUsedRoot>(requestUrl).pipe(map((response) => this.transformFrequentlyUsedData(response)));
  }

  protected transformDiscoverMapsData(rootObject: DiscoverMapsRoot): DiscoverMapsItem[] {
    return rootObject['discover-maps'].map((discoverMapData) => {
      return {
        id: discoverMapData.flex_id,
        title: discoverMapData.title,
        description: discoverMapData.description,
        mapId: discoverMapData.id,
        fromDate: this.timeService.createDateFromString(discoverMapData.from_date, DATE_FORMAT),
        toDate: this.timeService.createDateFromString(discoverMapData.to_date, DATE_FORMAT),
        image: {
          url: this.createFullImageUrl(discoverMapData.image.path),
          name: discoverMapData.image.name,
          type: discoverMapData.image.type,
          size: discoverMapData.image.size,
          path: discoverMapData.image.path,
          altText: discoverMapData.image_alt,
        },
      };
    });
  }

  protected transformPageInfosData(rootObject: PageInfosRoot): PageNotification[] {
    return rootObject['page-infos'].map((pageInfoData) => {
      return {
        id: pageInfoData.flex_id,
        title: pageInfoData.title,
        description: pageInfoData.description,
        pages: this.transformPagesToMainPages(pageInfoData.pages),
        fromDate: this.timeService.createDateFromString(pageInfoData.from_date, DATE_FORMAT),
        toDate: this.timeService.createDateFromString(pageInfoData.to_date, DATE_FORMAT),
        severity: pageInfoData.severity as PageNotificationSeverity,
        isMarkedAsRead: false,
      };
    });
  }

  protected transformFrequentlyUsedData(rootObject: FrequentlyUsedRoot): FrequentlyUsedItem[] {
    return rootObject['frequently-used'].map((frequentlyUsedData) => {
      return {
        id: frequentlyUsedData.flex_id,
        title: frequentlyUsedData.title,
        description: frequentlyUsedData.description,
        url: frequentlyUsedData.url,
        image: frequentlyUsedData.image
          ? {
              url: this.createFullImageUrl(frequentlyUsedData.image.path),
              name: frequentlyUsedData.image.name,
              type: frequentlyUsedData.image.type,
              size: frequentlyUsedData.image.size,
              path: frequentlyUsedData.image.path,
              altText: frequentlyUsedData.image_alt,
            }
          : undefined,
        created: this.timeService.createDateFromUnixTimestamp(Number(frequentlyUsedData.created)),
      };
    });
  }

  private transformPagesToMainPages(pages: Pages): MainPage[] {
    const transformedPages: MainPage[] = [];
    if (pages.map) {
      transformedPages.push(MainPage.Maps);
    }
    if (pages.start) {
      transformedPages.push(MainPage.Start);
    }
    if (pages.datacatalogue) {
      transformedPages.push(MainPage.Data);
    }
    if (pages.support) {
      transformedPages.push(MainPage.Support);
    }
    return transformedPages;
  }

  private createFullImageUrl(imagePath: string): string {
    const url = new URL(`${this.apiBaseUrl}/${imagePath}`);
    return url.toString();
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
