import {Injectable, OnDestroy, inject} from '@angular/core';
import {distinctUntilChanged, map, Observable, of, Subscription, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapDrawingService} from './map-drawing.service';
import {MAP_SERVICE} from '../../app.tokens';
import {MapService} from '../interfaces/map.service';
import {selectFeatureHighlightToDraw} from '../../state/map/selectors/query-graphics.selector';
import {GeometryWithSrs} from 'src/app/shared/interfaces/geojson-types-with-srs.interface';
import {FeatureHighlightSource} from 'src/app/shared/interfaces/feature-highlight.interface';

@Injectable()
export class FeatureHighlightingService implements OnDestroy {
  private readonly store = inject(Store);
  private readonly mapDrawingService = inject(MapDrawingService);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  private readonly featureHighlightToDraw$ = this.store.select(selectFeatureHighlightToDraw);
  private subscription?: Subscription;
  private initialized = false;

  public init() {
    this.initialized = true;
    this.subscription?.unsubscribe();
    this.subscription = this.featureHighlightToDraw$
      .pipe(
        distinctUntilChanged(
          (previous, current) =>
            previous.geometry === current.geometry && previous.source === current.source && previous.ready === current.ready,
        ),
        switchMap(({geometry, source, ready}) => this.observeVisibleGeometry(source, geometry, ready)),
        tap((feature) => this.updateHighlightedFeature(feature)),
      )
      .subscribe();
  }

  private observeVisibleGeometry<T>(
    source: FeatureHighlightSource | undefined,
    geometry: T | undefined,
    ready: boolean,
  ): Observable<T | undefined> {
    if (!ready || !geometry || !source) {
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
  }

  private updateHighlightedFeature(feature: GeometryWithSrs | undefined) {
    if (feature) {
      this.highlightFeature(feature);
      return;
    }

    this.removeHighlightedFeature();
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
