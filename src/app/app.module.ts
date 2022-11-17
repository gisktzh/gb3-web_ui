import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {PageModule} from './page/page.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './core/state';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, PageModule, BrowserAnimationsModule, StoreModule.forRoot(reducers, {
      metaReducers
    })],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
