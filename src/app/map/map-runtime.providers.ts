import {makeEnvironmentProviders} from '@angular/core';
import {provideEffects} from '@ngrx/effects';
import {DRAWING_SYMBOLS_SERVICE, MAP_LOADER_SERVICE, MAP_SERVICE} from '../app.tokens';
import {Gb3PrintService} from '../shared/services/apis/gb3/gb3-print.service';
import {Gb3ShareLinkService} from '../shared/services/apis/gb3/gb3-share-link.service';
import {MAP_EFFECTS} from '../state/map/map.effects';
import {EsriDrawingSymbolsService} from './services/esri-services/esri-drawing-symbols.service';
import {EsriMapLoaderService} from './services/esri-services/esri-map-loader.service';
import {EsriMapService} from './services/esri-services/esri-map.service';
import {FavouritesService} from './services/favourites.service';
import {MapDrawingService} from './services/map-drawing.service';

export function provideMapRuntime() {
  return makeEnvironmentProviders([
    {provide: MAP_SERVICE, useClass: EsriMapService},
    {provide: MAP_LOADER_SERVICE, useClass: EsriMapLoaderService},
    {provide: DRAWING_SYMBOLS_SERVICE, useClass: EsriDrawingSymbolsService},
    MapDrawingService,
    FavouritesService,
    Gb3ShareLinkService,
    Gb3PrintService,
    provideEffects(MAP_EFFECTS),
  ]);
}
