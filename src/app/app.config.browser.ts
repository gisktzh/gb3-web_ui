import {ApplicationConfig, ErrorHandler, importProvidersFrom} from '@angular/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {EFFECTS_ERROR_HANDLER, provideEffects} from '@ngrx/effects';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {AuthModule} from './auth/auth.module';
import {EmbeddedErrorHandlerService} from './embedded-page/services/embedded-error-handler.service';
import {ErrorHandlerService} from './error-handling/error-handler.service';
import {EsriDrawingSymbolsService} from './map/services/esri-services/esri-drawing-symbols.service';
import {EsriMapLoaderService} from './map/services/esri-services/esri-map-loader.service';
import {EsriMapService} from './map/services/esri-services/esri-map.service';
import {DRAWING_SYMBOLS_SERVICE, MAP_LOADER_SERVICE, MAP_SERVICE} from './app.tokens';
import {errorHandlerServiceFactory} from './shared/factories/error-handler-service.factory';
import {effectErrorHandler} from './state/app/effects/effects-error-handler.effects';
import {effects} from './state';

export const browserConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AuthModule),
    {provide: ErrorHandler, deps: [Router, ErrorHandlerService, EmbeddedErrorHandlerService], useFactory: errorHandlerServiceFactory},
    {provide: MAP_SERVICE, useClass: EsriMapService},
    {provide: MAP_LOADER_SERVICE, useClass: EsriMapLoaderService},
    {provide: DRAWING_SYMBOLS_SERVICE, useClass: EsriDrawingSymbolsService},
    {
      provide: EFFECTS_ERROR_HANDLER,
      useValue: effectErrorHandler,
    },
    provideEffects(effects),
    provideStoreDevtools({
      maxAge: 3,
      trace: false,
      traceLimit: 75,
      connectInZone: true,
    }),
    provideAnimations(),
    provideUiTour(),
  ],
};
