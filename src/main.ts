/// <reference types="@angular/localize" />

import {enableProdMode, ErrorHandler, LOCALE_ID, importProvidersFrom} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {environment} from './environments/environment';
import {Router} from '@angular/router';
import {ErrorHandlerService} from './app/error-handling/error-handler.service';
import {EmbeddedErrorHandlerService} from './app/embedded-page/services/embedded-error-handler.service';
import {errorHandlerServiceFactory} from './app/shared/factories/error-handler-service.factory';
import {MAP_SERVICE, MAP_LOADER_SERVICE, TIME_SERVICE, NEWS_SERVICE, GRAV_CMS_SERVICE} from './app/app.tokens';
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
import {EFFECTS_ERROR_HANDLER, EffectsModule} from '@ngrx/effects';
import {effectErrorHandler} from './app/state/app/effects/effects-error-handler.effects';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AppRoutingModule} from './app/app-routing.module';
import {provideAnimations} from '@angular/platform-browser/animations';
import {BrowserModule, bootstrapApplication} from '@angular/platform-browser';
import {SharedModule} from './app/shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {reducers, metaReducers, effects} from './app/state';
import {AuthModule} from './app/auth/auth.module';
import {ErrorHandlingModule} from './app/error-handling/error-handling.module';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {AppComponent} from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AppRoutingModule,
      BrowserModule,
      SharedModule,
      StoreModule.forRoot(reducers, {metaReducers}),
      EffectsModule.forRoot(effects),
      AuthModule,
      ErrorHandlingModule,
      StoreRouterConnectingModule.forRoot(),
    ),
    {provide: ErrorHandler, deps: [Router, ErrorHandlerService, EmbeddedErrorHandlerService], useFactory: errorHandlerServiceFactory},
    {provide: MAP_SERVICE, useClass: EsriMapService},
    {provide: MAP_LOADER_SERVICE, useClass: EsriMapLoaderService},
    {provide: TIME_SERVICE, useFactory: timeServiceFactory},
    {provide: NEWS_SERVICE, deps: [KTZHNewsService, KTZHNewsServiceMock, ConfigService], useFactory: newsFactory},
    {provide: GRAV_CMS_SERVICE, deps: [GravCmsService, GravCmsServiceMock, ConfigService], useFactory: gravCmsFactory},
    {provide: LOCALE_ID, useValue: 'de-CH'},
    {
      provide: EFFECTS_ERROR_HANDLER,
      useValue: effectErrorHandler,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
