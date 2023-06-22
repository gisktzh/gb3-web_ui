import {Inject, Injectable, OnDestroy} from '@angular/core';
import {MAP_SERVICE} from '../../app.module';
import {MapService} from '../interfaces/map.service';
import {GeometryWithSrs, PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {DrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {combineLatestWith, filter, Subscription, tap} from 'rxjs';
import {selectCurrentGpsLocation} from '../../state/map/reducers/geolocation.reducer';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../shared/services/config.service';
import {selectReady} from '../../state/map/reducers/map-config.reducer';

@Injectable({
  providedIn: 'root'
})
export class MapDrawingService implements OnDestroy {
  private readonly isMapReady$ = this.store.select(selectReady);
  private readonly currentGpsLocation$ = this.store.select(selectCurrentGpsLocation);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly store: Store,
    private readonly configService: ConfigService
  ) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public drawFeatureInfoHighlight(geometry: GeometryWithSrs): void {
    this.mapService.addGeometryToDrawingLayer(geometry, DrawingLayer.FeatureHighlight);
  }

  public clearFeatureInfoHighlight() {
    this.mapService.clearDrawingLayer(DrawingLayer.FeatureHighlight);
  }

  public drawFeatureQueryLocation(geometry: GeometryWithSrs): void {
    this.clearFeatureQueryLocation();
    this.mapService.addGeometryToDrawingLayer(geometry, DrawingLayer.FeatureQueryLocation);
  }

  public clearFeatureQueryLocation(): void {
    this.mapService.clearDrawingLayer(DrawingLayer.FeatureQueryLocation);
  }

  public drawPrintAreaHighlight(geometry: GeometryWithSrs) {
    this.mapService.addGeometryToDrawingLayer(geometry, DrawingLayer.FeatureHighlight);
  }

  public clearPrintAreaHighlight() {
    this.mapService.clearDrawingLayer(DrawingLayer.FeatureHighlight);
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
          })
        )
        .subscribe()
    );
  }

  private handleGpsLocation(location: PointWithSrs | undefined): Promise<never> | void {
    this.mapService.clearDrawingLayer(DrawingLayer.LocatePosition);
    if (location) {
      this.mapService.addGeometryToDrawingLayer(location, DrawingLayer.LocatePosition);
      return this.mapService.zoomToPoint(location, this.configService.mapConfig.locateMeZoom);
    }
  }
}
