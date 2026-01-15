/// <reference types="@angular/localize" />

import {enableProdMode, ErrorHandler, importProvidersFrom, LOCALE_ID} from '@angular/core';

import {environment} from './environments/environment';
import {provideRouter, Router, withInMemoryScrolling} from '@angular/router';
import {ErrorHandlerService} from './app/error-handling/error-handler.service';
import {EmbeddedErrorHandlerService} from './app/embedded-page/services/embedded-error-handler.service';
import {errorHandlerServiceFactory} from './app/shared/factories/error-handler-service.factory';
import {GRAV_CMS_SERVICE, MAP_LOADER_SERVICE, MAP_SERVICE, NEWS_SERVICE, TIME_SERVICE, DRAWING_SYMBOLS_SERVICE} from './app/app.tokens';
import {EsriMapService} from './app/map/services/esri-services/esri-map.service';
import {EsriMapLoaderService} from './app/map/services/esri-services/esri-map-loader.service';
import {timeServiceFactory} from './app/shared/factories/time-service.factory';
import {KTZHNewsService} from './app/shared/services/apis/ktzh/ktzhnews.service';
import {KTZHNewsServiceMock} from './app/shared/services/apis/ktzh/ktzhnews.service.mock';
import {ConfigService} from './app/shared/services/config.service';
import {newsFactory} from './app/shared/factories/news.factory';
import {GravCmsService} from './app/shared/services/apis/grav-cms/grav-cms.service';
import {GravCmsServiceMock} from './app/shared/services/apis/grav-cms/grav-cms.service.mock';
import {gravCmsFactory} from './app/shared/factories/grav-cms.factory';
import {EFFECTS_ERROR_HANDLER, provideEffects} from '@ngrx/effects';
import {effectErrorHandler} from './app/state/app/effects/effects-error-handler.effects';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {APP_ROUTES} from './app/app.routes';
import {provideAnimations} from '@angular/platform-browser/animations';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideStore} from '@ngrx/store';
import {effects, metaReducers, reducers} from './app/state';
import {provideRouterStore} from '@ngrx/router-store';
import {AppComponent} from './app/app.component';
import {AuthModule} from './app/auth/auth.module';
import {EsriDrawingSymbolsService} from './app/map/services/esri-services/drawing-symbols-service/esri-drawing-symbols.service';
import {provideStoreDevtools} from '@ngrx/store-devtools';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AuthModule),
    {provide: ErrorHandler, deps: [Router, ErrorHandlerService, EmbeddedErrorHandlerService], useFactory: errorHandlerServiceFactory},
    {provide: MAP_SERVICE, useClass: EsriMapService},
    {provide: MAP_LOADER_SERVICE, useClass: EsriMapLoaderService},
    {provide: TIME_SERVICE, useFactory: timeServiceFactory},
    {provide: NEWS_SERVICE, deps: [KTZHNewsService, KTZHNewsServiceMock, ConfigService], useFactory: newsFactory},
    {provide: GRAV_CMS_SERVICE, deps: [GravCmsService, GravCmsServiceMock, ConfigService], useFactory: gravCmsFactory},
    {provide: DRAWING_SYMBOLS_SERVICE, useClass: EsriDrawingSymbolsService},
    {provide: LOCALE_ID, useValue: 'de-CH'},
    {
      provide: EFFECTS_ERROR_HANDLER,
      useValue: effectErrorHandler,
    },
    provideRouter(APP_ROUTES, withInMemoryScrolling({scrollPositionRestoration: 'enabled'})),
    provideStore(reducers, {metaReducers}),
    provideStoreDevtools({
      maxAge: 3, // Retains last 25 states
      trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
      traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
      connectInZone: true,
    }),
    provideEffects(effects),
    provideRouterStore(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
