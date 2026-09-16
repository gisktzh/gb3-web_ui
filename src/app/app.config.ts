import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {ApplicationConfig, LOCALE_ID} from '@angular/core';
import {provideClientHydration, withEventReplay, withHttpTransferCacheOptions} from '@angular/platform-browser';
import {provideRouter, withInMemoryScrolling} from '@angular/router';
import {provideRouterStore} from '@ngrx/router-store';
import {provideStore} from '@ngrx/store';
import {APP_ROUTES} from './app.routes';
import {GRAV_CMS_SERVICE, NEWS_SERVICE, TIME_SERVICE} from './app.tokens';
import {gravCmsFactory} from './shared/factories/grav-cms.factory';
import {newsFactory} from './shared/factories/news.factory';
import {timeServiceFactory} from './shared/factories/time-service.factory';
import {GravCmsService} from './shared/services/apis/grav-cms/grav-cms.service';
import {GravCmsServiceMock} from './shared/services/apis/grav-cms/grav-cms.service.mock';
import {KTZHNewsService} from './shared/services/apis/ktzh/ktzhnews.service';
import {KTZHNewsServiceMock} from './shared/services/apis/ktzh/ktzhnews.service.mock';
import {ConfigService} from './shared/services/config.service';
import {metaReducers, reducers} from './state';

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: TIME_SERVICE, useFactory: timeServiceFactory},
    {provide: NEWS_SERVICE, deps: [KTZHNewsService, KTZHNewsServiceMock, ConfigService], useFactory: newsFactory},
    {provide: GRAV_CMS_SERVICE, deps: [GravCmsService, GravCmsServiceMock, ConfigService], useFactory: gravCmsFactory},
    {provide: LOCALE_ID, useValue: 'de-CH'},
    provideRouter(APP_ROUTES, withInMemoryScrolling({scrollPositionRestoration: 'enabled'})),
    provideStore(reducers, {metaReducers}),
    provideRouterStore(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        filter: (request) => request.method === 'GET' && (request.url.includes('/cms/') || request.url.includes('zhweb-news.json')),
      }),
    ),
  ],
};
