import {registerLocaleData} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import localeDeCH from '@angular/common/locales/de-CH';
import {ErrorHandler, InjectionToken, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthModule} from './auth/auth.module';
import {EmbeddedErrorHandlerService} from './embedded-page/services/embedded-error-handler.service';
import {ErrorHandlerService} from './error-handling/error-handler.service';
import {ErrorHandlingModule} from './error-handling/error-handling.module';
import {MapService} from './map/interfaces/map.service';
import {EsriMapService} from './map/services/esri-services/esri-map.service';
import {errorHandlerServiceFactory} from './shared/factories/error-handler-service.factory';
import {gravCmsFactory} from './shared/factories/grav-cms.factory';
import {newsFactory} from './shared/factories/news.factory';
import {NewsService} from './shared/interfaces/news-service.interface';
import {GravCmsService} from './shared/services/apis/grav-cms/grav-cms.service';
import {GravCmsServiceMock} from './shared/services/apis/grav-cms/grav-cms.service.mock';
import {KTZHNewsService} from './shared/services/apis/ktzh/ktzhnews.service';
import {KTZHNewsServiceMock} from './shared/services/apis/ktzh/ktzhnews.service.mock';
import {ConfigService} from './shared/services/config.service';
import {SharedModule} from './shared/shared.module';
import {effects, metaReducers, reducers} from './state';
import {StoreRouterConnectingModule} from '@ngrx/router-store';

// necessary for the locale 'de-CH' to work
// see https://stackoverflow.com/questions/46419026/missing-locale-data-for-the-locale-xxx-with-angular
registerLocaleData(localeDeCH);

export const MAP_SERVICE = new InjectionToken<MapService>('MapService');
export const NEWS_SERVICE = new InjectionToken<NewsService>('NewsService');
export const GRAV_CMS_SERVICE = new InjectionToken<GravCmsService>('GravCmsService');

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    SharedModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    EffectsModule.forRoot(effects),
    AuthModule,
    ErrorHandlingModule,
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [
    {provide: ErrorHandler, deps: [Router, ErrorHandlerService, EmbeddedErrorHandlerService], useFactory: errorHandlerServiceFactory},
    {provide: MAP_SERVICE, useClass: EsriMapService},
    {provide: NEWS_SERVICE, deps: [KTZHNewsService, KTZHNewsServiceMock, ConfigService], useFactory: newsFactory},
    {provide: GRAV_CMS_SERVICE, deps: [GravCmsService, GravCmsServiceMock, ConfigService], useFactory: gravCmsFactory},
    {provide: LOCALE_ID, useValue: 'de-CH'},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
