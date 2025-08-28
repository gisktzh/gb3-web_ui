import {Injectable, OnDestroy, inject} from '@angular/core';
import {MapService} from '../interfaces/map.service';
import {GeometryWithSrs, PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {InternalDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {combineLatestWith, filter, Subscription, tap} from 'rxjs';
import {selectCurrentGpsLocation} from '../../state/map/reducers/geolocation.reducer';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../shared/services/config.service';
import {selectReady} from '../../state/map/reducers/map-config.reducer';
import {MAP_SERVICE} from '../../app.tokens';

export const ELEVATION_PROFILE_LOCATION_IDENTIFIER = 'elevation_profile_location';

@Injectable({
  providedIn: 'root',
})
export class MapDrawingService implements OnDestroy {
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);

  private readonly isMapReady$ = this.store.select(selectReady);
  private readonly currentGpsLocation$ = this.store.select(selectCurrentGpsLocation);
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public drawElevationProfileHoverLocation(geometry: PointWithSrs) {
    this.removeElevationProfileHoverLocation();
    this.mapService.addGeometryToInternalDrawingLayer(
      geometry,
      InternalDrawingLayer.ElevationProfile,
      ELEVATION_PROFILE_LOCATION_IDENTIFIER,
    );
  }

  public removeElevationProfileHoverLocation() {
    this.mapService.removeGeometryFromInternalDrawingLayer(InternalDrawingLayer.ElevationProfile, ELEVATION_PROFILE_LOCATION_IDENTIFIER);
  }

  public drawFeatureInfoHighlight(geometry: GeometryWithSrs) {
    this.mapService.addGeometryToInternalDrawingLayer(geometry, InternalDrawingLayer.FeatureHighlight);
  }

  public clearFeatureInfoHighlight() {
    this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.FeatureHighlight);
  }

  public drawFeatureQueryLocation(geometry: GeometryWithSrs) {
    this.clearFeatureQueryLocation();
    this.mapService.addGeometryToInternalDrawingLayer(geometry, InternalDrawingLayer.FeatureQueryLocation);
  }

  public clearFeatureQueryLocation() {
    this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.FeatureQueryLocation);
  }

  public async startDrawPrintPreview(extentWidth: number, extentHeight: number, rotation: number) {
    await this.mapService.startDrawPrintPreview(extentWidth, extentHeight, rotation);
  }

  public stopDrawPrintPreview() {
    this.mapService.stopDrawPrintPreview();
  }

  public clearDataDownloadSelection() {
    this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.Selection);
  }

  public drawSearchResultHighlight(geometry: GeometryWithSrs) {
    this.clearSearchResultHighlight();
    this.mapService.addGeometryToInternalDrawingLayer(geometry, InternalDrawingLayer.SearchResultHighlight);
  }

  public clearSearchResultHighlight() {
    this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.SearchResultHighlight);
  }

  private initSubscriptions() {
    // todo: when adding the redlining, this might be refactored away as an effect.
    this.subscriptions.add(
      this.currentGpsLocation$
        .pipe(
          combineLatestWith(this.isMapReady$),
          filter(([_, isMapReady]) => isMapReady),
          tap(([location, _]) => {
            this.handleGpsLocation(location);
          }),
        )
        .subscribe(),
    );
  }

  private handleGpsLocation(location: PointWithSrs | undefined): Promise<never> | void {
    this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.LocatePosition);
    if (location) {
      this.mapService.addGeometryToInternalDrawingLayer(location, InternalDrawingLayer.LocatePosition);
      return this.mapService.zoomToPoint(location, this.configService.mapConfig.locateMeZoom);
    }
  }
}
