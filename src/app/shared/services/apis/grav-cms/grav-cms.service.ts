import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {Observable} from 'rxjs';
import {DiscoverMapsItem} from '../../../interfaces/discover-maps-item.interface';
import {map} from 'rxjs/operators';
import {DiscoverMapsRoot, MapInfosRoot, PageInfosRoot, Pages} from '../../../models/grav-cms-generated.interface';
import {PageNotification, PageNotificationSeverity} from '../../../interfaces/page-notification.interface';
import * as dayjs from 'dayjs';
import {MapInfoNotification} from '../../../interfaces/map-info-notification.interface';
import {MainPage} from '../../../enums/main-page.enum';

@Injectable({
  providedIn: 'root'
})
export class GravCmsService extends BaseApiService {
  protected apiBaseUrl: string = this.configService.apiConfig.gravCms.baseUrl;
  private readonly discoverMapsEndpoint: string = 'discovermaps.json';
  private readonly pageInfosEndpoint: string = 'pageinfos.json';
  private readonly mapInfosEndpoint: string = 'mapinfos.json';
  private readonly timeFormat = 'DD.MM.YYYY';

  public loadDiscoverMapsData(): Observable<DiscoverMapsItem[]> {
    const requestUrl = this.createFullEndpointUrl(this.discoverMapsEndpoint);
    return this.get<DiscoverMapsRoot>(requestUrl).pipe(map((response) => this.transformDiscoverMapsData(response)));
  }

  public loadPageInfosData(): Observable<PageNotification[]> {
    const requestUrl = this.createFullEndpointUrl(this.pageInfosEndpoint);
    return this.get<PageInfosRoot>(requestUrl).pipe(map((response) => this.transformPageInfosData(response)));
  }

  public loadMapInfosData(): Observable<MapInfoNotification[]> {
    const requestUrl = this.createFullEndpointUrl(this.mapInfosEndpoint);
    return this.get<MapInfosRoot>(requestUrl).pipe(map((response) => this.transformMapInfosData(response)));
  }

  private transformDiscoverMapsData(rootObject: DiscoverMapsRoot): DiscoverMapsItem[] {
    return rootObject['discover-maps'].map((discoverMapData) => {
      return {
        ...discoverMapData,
        id: discoverMapData.flex_id,
        mapId: discoverMapData.id,
        fromDate: discoverMapData.from_date,
        toDate: discoverMapData.to_date,
        image: {
          ...discoverMapData.image,
          url: this.createFullImageUrl(discoverMapData.image.path)
        }
      };
    });
  }

  private transformPageInfosData(rootObject: PageInfosRoot): PageNotification[] {
    return rootObject['page-infos'].map((pageInfoData) => {
      return {
        ...pageInfoData,
        id: pageInfoData.flex_id,
        fromDate: dayjs(pageInfoData.from_date, this.timeFormat).toDate(),
        toDate: dayjs(pageInfoData.to_date, this.timeFormat).toDate(),
        pages: this.transformPagesToEnumArray(pageInfoData.pages),
        severity: pageInfoData.severity as PageNotificationSeverity,
        isMarkedAsRead: false
      };
    });
  }

  private transformPagesToEnumArray(pages: Pages): MainPage[] {
    const transformedPages: MainPage[] = [];
    if (pages.map) transformedPages.push(MainPage.Maps);
    if (pages.start) transformedPages.push(MainPage.Start);
    if (pages.datacatalogue) transformedPages.push(MainPage.Data);
    if (pages.support) transformedPages.push(MainPage.Support);
    return transformedPages;
  }

  private transformMapInfosData(rootObject: MapInfosRoot): MapInfoNotification[] {
    return rootObject['map-infos'].map((mapInfoData) => {
      return {
        ...mapInfoData,
        id: mapInfoData.flex_id,
        fromDate: dayjs(mapInfoData.from_date, this.timeFormat).toDate(),
        toDate: dayjs(mapInfoData.to_date, this.timeFormat).toDate()
      };
    });
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
