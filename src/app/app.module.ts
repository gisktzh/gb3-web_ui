import {InjectionToken, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {effects, metaReducers, reducers} from './state';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from './shared/shared.module';
import {EffectsModule} from '@ngrx/effects';
import {EsriMapService} from './map/services/esri-services/esri-map.service';
import {MapService} from './map/interfaces/map.service';
import {KTZHNewsMockService} from './shared/services/apis/ktzh/ktzhnews.mock.service';
import {NewsService} from './shared/interfaces/news-service.interface';
import {AuthModule} from './auth/auth.module';
import {GravCmsService} from './shared/services/apis/grav-cms/grav-cms.service';
import {GravCmsMockService} from './shared/services/apis/grav-cms/grav-cms.mock.service';
import {ConfigService} from './shared/services/config.service';
import {KTZHNewsService} from './shared/services/apis/ktzh/ktzhnews.service';
import {registerLocaleData} from '@angular/common';
import localeDeCH from '@angular/common/locales/de-CH';

// necessary for the locale 'de-CH' to work
// see https://stackoverflow.com/questions/46419026/missing-locale-data-for-the-locale-xxx-with-angular
registerLocaleData(localeDeCH);

function newsFactory<T>(service: T, mockService: T, configService: ConfigService): T {
  return serviceFactory(service, mockService, configService.apiConfig.ktzhWebsite.useMockData);
}

function gravCmsFactory<T>(service: T, mockService: T, configService: ConfigService): T {
  return serviceFactory(service, mockService, configService.apiConfig.gravCms.useMockData);
}

function serviceFactory<T>(service: T, mockService: T, useMockService: boolean = false): T {
  return useMockService ? mockService : service;
}

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
  ],
  providers: [
    {provide: MAP_SERVICE, useClass: EsriMapService},
    {provide: NEWS_SERVICE, deps: [KTZHNewsService, KTZHNewsMockService, ConfigService], useFactory: newsFactory},
    {provide: GRAV_CMS_SERVICE, deps: [GravCmsService, GravCmsMockService, ConfigService], useFactory: gravCmsFactory},
    {provide: LOCALE_ID, useValue: 'de-CH'},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
