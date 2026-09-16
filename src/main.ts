/// <reference types="@angular/localize" />

import {enableProdMode, mergeApplicationConfig} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import {browserConfig} from './app/app.config.browser';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, mergeApplicationConfig(appConfig, browserConfig)).catch((err) => console.error(err));
