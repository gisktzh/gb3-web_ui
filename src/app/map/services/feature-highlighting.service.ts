import {Injectable} from '@angular/core';
import {MapService} from './map.service';
import {selectHighlightedFeature} from '../../core/state/map/reducers/feature-info.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {GeoJSONMapperService} from '../../shared/services/geo-json-mapper.service';
import {Geometry as GeoJSONGeometry} from 'geojson';
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import {Geometry as EsriGeometry} from '@arcgis/core/geometry';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {defaultHighlightStyles} from 'src/app/shared/configs/feature-info-config';
import {Symbol as EsriSymbol} from '@arcgis/core/symbols';
import {selectReady} from '../../core/state/map/reducers/map-configuration.reducer';

@Injectable({
  providedIn: 'root'
})
export class FeatureHighlightingService {
  private readonly defaultHighlightColors = {
    feature: new Color(defaultHighlightStyles.feature.color),
    outline: new Color(defaultHighlightStyles.outline.color)
  };
  private readonly defaultHighlightStyles = new Map<EsriGeometry['type'], EsriSymbol>([
    [
      'polyline',
      new SimpleLineSymbol({
        color: this.defaultHighlightColors.feature,
        width: defaultHighlightStyles.feature.width
      })
    ],
    ['point', new SimpleMarkerSymbol({color: this.defaultHighlightColors.feature})],
    ['multipoint', new SimpleMarkerSymbol({color: this.defaultHighlightColors.feature})],
    ['polygon', new SimpleFillSymbol({color: this.defaultHighlightColors.feature})]
  ]);
  private readonly highlightedFeature$ = this.store.select(selectHighlightedFeature);
  private readonly mapReadyState$ = this.store.select(selectReady);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly mapService: MapService,
    private readonly geoJSONMapperService: GeoJSONMapperService
  ) {
    this.initMapReadySubscription();
  }

  private initMapReadySubscription() {
    // Only subscribe to highlighted feature once the map is ready, and we have a MapView instance
    this.subscriptions.add(
      this.mapReadyState$
        .pipe(
          tap((isReady) => {
            if (isReady) {
              this.initHighlightSubscription();
            }
          })
        )
        .subscribe()
    );
  }

  private initHighlightSubscription() {
    this.subscriptions.add(
      this.highlightedFeature$
        .pipe(tap((feature) => (feature ? this.highlightFeature(feature) : this.removeHighlightedFeature())))
        .subscribe()
    );
  }

  private highlightFeature(feature: GeoJSONGeometry) {
    this.removeHighlightedFeature(); // make sure we have a clean slate

    const geometry = this.geoJSONMapperService.fromGeoJSONToEsri(feature);
    const symbolization = this.defaultHighlightStyles.get(geometry.type);
    const highlightedFeature = new Graphic({geometry: geometry, symbol: symbolization});

    this.mapService.addGraphic(highlightedFeature);
  }

  private removeHighlightedFeature() {
    this.mapService.removeAllGraphics();
  }
}
