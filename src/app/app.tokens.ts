import {InjectionToken} from '@angular/core';
import {MapLoaderService} from './map/interfaces/map-loader.service';
import {GravCmsService} from './shared/services/apis/grav-cms/grav-cms.service';
import {MapService} from './map/interfaces/map.service';
import {TimeService} from './shared/interfaces/time-service.interface';
import {NewsService} from './shared/interfaces/news-service.interface';

export const MAP_LOADER_SERVICE = new InjectionToken<MapLoaderService>('MapLoaderService');
export const MAP_SERVICE = new InjectionToken<MapService>('MapService');
export const NEWS_SERVICE = new InjectionToken<NewsService>('NewsService');
export const GRAV_CMS_SERVICE = new InjectionToken<GravCmsService>('GravCmsService');
export const TIME_SERVICE = new InjectionToken<TimeService>('TimeService');
