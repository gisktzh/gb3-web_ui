import {Injectable, OnDestroy, inject} from '@angular/core';
import {selectHighlightedFeature} from '../../state/map/reducers/feature-info.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectReady} from '../../state/map/reducers/map-config.reducer';
import {GeometryWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {MapDrawingService} from './map-drawing.service';

@Injectable()
export class FeatureHighlightingService implements OnDestroy {
  private readonly store = inject(Store);
  private readonly mapDrawingService = inject(MapDrawingService);

  private readonly highlightedFeature$ = this.store.select(selectHighlightedFeature);
  private readonly mapReadyState$ = this.store.select(selectReady);
  private readonly subscriptions = new Subscription();

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
          }),
        )
        .subscribe(),
    );
  }

  private initHighlightSubscription() {
    this.subscriptions.add(
      this.highlightedFeature$
        .pipe(tap((feature) => (feature ? this.highlightFeature(feature) : this.removeHighlightedFeature())))
        .subscribe(),
    );
  }

  private highlightFeature(feature: GeometryWithSrs) {
    this.removeHighlightedFeature(); // make sure we have a clean slate
    this.mapDrawingService.drawFeatureInfoHighlight(feature);
  }

  private removeHighlightedFeature() {
    this.mapDrawingService.clearFeatureInfoHighlight();
  }
}
