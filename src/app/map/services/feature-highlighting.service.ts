import {Injectable, OnDestroy, inject} from '@angular/core';
import {selectFeatureInfoState} from '../../state/map/reducers/feature-info.reducer';
import {distinctUntilChanged, map, of, Subscription, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectReady} from '../../state/map/reducers/map-config.reducer';
import {GeometryWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {MapDrawingService} from './map-drawing.service';
import {MAP_SERVICE} from '../../app.tokens';
import {MapService} from '../interfaces/map.service';

@Injectable()
export class FeatureHighlightingService implements OnDestroy {
  private readonly store = inject(Store);
  private readonly mapDrawingService = inject(MapDrawingService);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  private readonly featureInfoState$ = this.store.select(selectFeatureInfoState);
  private readonly mapReadyState$ = this.store.select(selectReady);
  private readonly subscriptions = new Subscription();
  private initialized = false;

  public init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.subscriptions.add(
      this.mapReadyState$
        .pipe(
          distinctUntilChanged(),
          switchMap((isReady) =>
            isReady
              ? this.featureInfoState$.pipe(
                  distinctUntilChanged(
                    (previous, current) =>
                      previous.highlightedFeature === current.highlightedFeature &&
                      previous.highlightedFeatureSource === current.highlightedFeatureSource,
                  ),
                  switchMap(({highlightedFeature, highlightedFeatureSource}) =>
                    highlightedFeature && highlightedFeatureSource
                      ? this.mapService
                          .observeFeatureInfoLayerVisibility(highlightedFeatureSource)
                          .pipe(map((visible) => (visible ? highlightedFeature : undefined)))
                      : of(undefined),
                  ),
                )
              : of(undefined),
          ),
          tap((feature) => (feature ? this.highlightFeature(feature) : this.removeHighlightedFeature())),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.removeHighlightedFeature();
  }

  private highlightFeature(feature: GeometryWithSrs) {
    this.removeHighlightedFeature(); // make sure we have a clean slate
    this.mapDrawingService.drawFeatureInfoHighlight(feature);
  }

  private removeHighlightedFeature() {
    this.mapDrawingService.clearFeatureInfoHighlight();
  }
}
