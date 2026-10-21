import {Injectable, OnDestroy, inject} from '@angular/core';
import {defaultIfEmpty, distinctUntilChanged, filter, map, of, Subscription, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapDrawingService} from './map-drawing.service';
import {MAP_SERVICE} from '../../app.tokens';
import {MapService} from '../interfaces/map.service';
import {selectFeatureHighlightToDraw} from '../../state/map/selectors/query-graphics.selector';
import {selectReady} from 'src/app/state/map/reducers/map-config.reducer';
import {GeometryWithSrs} from 'src/app/shared/interfaces/geojson-types-with-srs.interface';

@Injectable()
export class FeatureHighlightingService implements OnDestroy {
  private readonly store = inject(Store);
  private readonly mapDrawingService = inject(MapDrawingService);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  private readonly mapReadyState$ = this.store.select(selectReady);
  private readonly featureHighlightToDraw$ = this.store.select(selectFeatureHighlightToDraw);
  private subscription?: Subscription;
  private initialized = false;

  public init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.subscription?.unsubscribe();
    this.subscription = this.mapReadyState$
      .pipe(
        distinctUntilChanged(),
        switchMap((isReady) => {
          if (!isReady) {
            return of(undefined);
          }

          return this.featureHighlightToDraw$.pipe(
            distinctUntilChanged((previous, current) => previous.geometry === current.geometry && previous.source === current.source),
            switchMap(({geometry, source, ready}) => {
              if (!geometry || !source || !ready) {
                return of(undefined);
              }

              return this.mapService.observeFeatureInfoLayerVisibility(source).pipe(
                map((visible) => {
                  if (visible) {
                    return geometry;
                  }

                  return undefined;
                }),
              );
            }),
          );
        }),
        tap((feature) => {
          if (feature) {
            this.highlightFeature(feature);
            return;
          }

          this.removeHighlightedFeature();
        }),
      )
      .subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
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
