import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {Observable} from 'rxjs';
import {DiscoverMapsItem} from '../../../interfaces/discover-maps-item.interface';
import {map} from 'rxjs/operators';
import {DiscoverMapsRoot, FrequentlyUsedRoot, MapInfosRoot, PageInfosRoot, Pages} from '../../../models/grav-cms-generated.interfaces';
import {PageNotification, PageNotificationSeverity} from '../../../interfaces/page-notification.interface';
import dayjs from 'dayjs';
import {MapInfoNotification} from '../../../interfaces/map-info-notification.interface';
import {MainPage} from '../../../enums/main-page.enum';
import {FrequentlyUsedItem} from '../../../interfaces/frequently-used-item.interface';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
const DATE_FORMAT = 'DD.MM.YYYY';

@Injectable({
  providedIn: 'root',
})
export class GravCmsService extends BaseApiService {
  protected apiBaseUrl: string = this.configService.apiConfig.gravCms.baseUrl;
  private readonly discoverMapsEndpoint: string = 'discovermaps.json';
  private readonly pageInfosEndpoint: string = 'pageinfos.json';
  private readonly mapInfosEndpoint: string = 'mapinfos.json';
  private readonly frequentlyUsedItemsEndpoint: string = 'frequentlyused.json';

  public loadDiscoverMapsData(): Observable<DiscoverMapsItem[]> {
    const requestUrl = this.createFullEndpointUrl(this.discoverMapsEndpoint);
    return this.get<DiscoverMapsRoot>(requestUrl).pipe(map((response) => this.transformDiscoverMapsData(response)));
  }

  public loadPageInfosData(): Observable<PageNotification[]> {
    const requestUrl = this.createFullEndpointUrl(this.pageInfosEndpoint);
    return this.get<PageInfosRoot>(requestUrl).pipe(map((response) => this.transformPageInfosData(response)));
  }

  // TODO can this be removed (including all connected types/interfaces)?
  public loadMapInfosData(): Observable<MapInfoNotification[]> {
    const requestUrl = this.createFullEndpointUrl(this.mapInfosEndpoint);
    return this.get<MapInfosRoot>(requestUrl).pipe(map((response) => this.transformMapInfosData(response)));
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
        fromDate: dayjs(discoverMapData.from_date, DATE_FORMAT).toDate(),
        toDate: dayjs(discoverMapData.to_date, DATE_FORMAT).toDate(),
        image: {
          url: this.createFullImageUrl(discoverMapData.image.path),
          name: discoverMapData.image.name,
          type: discoverMapData.image.type,
          size: discoverMapData.image.size,
          path: discoverMapData.image.path,
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
        fromDate: dayjs(pageInfoData.from_date, DATE_FORMAT).toDate(),
        toDate: dayjs(pageInfoData.to_date, DATE_FORMAT).toDate(),
        severity: pageInfoData.severity as PageNotificationSeverity,
        isMarkedAsRead: false,
      };
    });
  }

  protected transformMapInfosData(rootObject: MapInfosRoot): MapInfoNotification[] {
    return rootObject['map-infos'].map((mapInfoData) => {
      return {
        ...mapInfoData,
        id: mapInfoData.flex_id,
        fromDate: dayjs(mapInfoData.from_date, DATE_FORMAT).toDate(),
        toDate: dayjs(mapInfoData.to_date, DATE_FORMAT).toDate(),
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
            }
          : undefined,
        created: dayjs.unix(+frequentlyUsedData.created).toDate(),
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
