import {ApplicationConfig, mergeApplicationConfig} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideServerRendering, withRoutes} from '@angular/ssr';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {appConfig} from './app.config';
import {serverRoutes} from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideNoopAnimations(),
    // Search controls register tour anchors while rendering, but tours are never started on the server.
    provideUiTour(),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
