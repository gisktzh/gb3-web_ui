import {InjectionToken, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {metaReducers, reducers} from './state';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from './shared/shared.module';
import {EffectsModule} from '@ngrx/effects';
import {ActiveMapItemEffects} from './state/map/effects/active-map-item.effects';
import {FeatureInfoEffects} from './state/map/effects/feature-info.effects';
import {LegendEffects} from './state/map/effects/legend.effects';
import {LayerCatalogEffects} from './state/map/effects/layer-catalog.effects';
import {MapConfigEffects} from './state/map/effects/map-config-effects.service';
import {EsriMapService} from './map/services/esri-services/esri-map.service';
import {MapService} from './map/interfaces/map.service';
import {KTZHNewsMockService} from './shared/services/apis/ktzh/ktzhnews-mock.service';
import {NewsService} from './shared/interfaces/news-service.interface';
import {AuthModule} from './auth/auth.module';
import {AuthStatusEffects} from './state/auth/effects/auth-status.effects';
import {FavouriteListEffects} from './state/map/effects/favourite-list.effects';
import {PageNotificationEffects} from './state/app/effects/page-notification.effects';
import {GeolocationEffects} from './state/map/effects/geolocation-effects.service';

export const MAP_SERVICE = new InjectionToken<MapService>('MapService');
export const NEWS_SERVICE = new InjectionToken<NewsService>('NewsService');

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    SharedModule,
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    EffectsModule.forRoot([
      ActiveMapItemEffects,
      FeatureInfoEffects,
      LayerCatalogEffects,
      LegendEffects,
      MapConfigEffects,
      AuthStatusEffects,
      FavouriteListEffects,
      PageNotificationEffects,
      GeolocationEffects
    ]),
    AuthModule
  ],
  providers: [
    {provide: MAP_SERVICE, useClass: EsriMapService},
    {provide: NEWS_SERVICE, useClass: KTZHNewsMockService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
