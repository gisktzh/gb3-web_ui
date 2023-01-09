import {NgModule} from '@angular/core';
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
import {ActiveTopicEffects} from './core/state/map/effects/active-topic.effects';
import {FeatureInfoEffects} from './core/state/map/effects/feature-info.effects';
import {LegendEffects} from './core/state/map/effects/legend.effects';

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
    EffectsModule.forRoot([ActiveTopicEffects, FeatureInfoEffects, LegendEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
