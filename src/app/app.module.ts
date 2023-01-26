import {InjectionToken, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StoreModule} from '@ngrx/store';
import {metaReducers, reducers} from './core/state';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from './shared/shared.module';
import {PageModule} from './page/page.module';
import {EffectsModule} from '@ngrx/effects';
import {ActiveMapItemEffects} from './core/state/map/effects/active-map-item.effects';
import {FeatureInfoEffects} from './core/state/map/effects/feature-info.effects';
import {LegendEffects} from './core/state/map/effects/legend.effects';
import {LayerCatalogEffects} from './core/state/map/effects/layer-catalog.effects';
import {MapConfigEffects} from './core/state/map/effects/map-config-effects.service';
import {EsriMapService} from './map/services/esri-map.service';
import {MapService} from './map/interfaces/map.service';
import {httpInterceptorProviders} from './shared/interceptors';

export const MAP_SERVICE = new InjectionToken<MapService>('MapService');

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    PageModule,
    SharedModule,
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    EffectsModule.forRoot([ActiveMapItemEffects, FeatureInfoEffects, LayerCatalogEffects, LegendEffects, MapConfigEffects])
  ],
  providers: [{provide: MAP_SERVICE, useClass: EsriMapService}, httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule {}
