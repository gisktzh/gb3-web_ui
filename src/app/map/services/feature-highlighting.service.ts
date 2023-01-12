import {Injectable, OnDestroy} from '@angular/core';
import {EsriMapService} from './esri-map.service';
import {selectHighlightedFeature} from '../../core/state/map/reducers/feature-info.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {Geometry as GeoJSONGeometry} from 'geojson';
import {selectReady} from '../../core/state/map/reducers/map-configuration.reducer';

@Injectable()
export class FeatureHighlightingService implements OnDestroy {
  private readonly highlightedFeature$ = this.store.select(selectHighlightedFeature);
  private readonly mapReadyState$ = this.store.select(selectReady);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store, private readonly mapService: EsriMapService) {}

  public init() {
    this.initMapReadySubscription();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    this.mapService.addHighlightGeometry(feature);
  }

  private removeHighlightedFeature() {
    this.mapService.removeAllHighlightGeometries();
  }
}
