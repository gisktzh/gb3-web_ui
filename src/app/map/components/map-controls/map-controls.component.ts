import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapConfigActions} from '../../../state/map/actions/map-config.actions';
import {ZoomType} from '../../../shared/types/zoom-type';
import {Subscription, tap} from 'rxjs';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../../../state/map/reducers/map-config.reducer';
import {GeolocationActions} from '../../../state/map/actions/geolocation.actions';
import {initialState as initialGeolocationState, selectGeolocationState} from '../../../state/map/reducers/geolocation.reducer';
import {GeolocationState} from '../../../state/map/states/geolocation.state';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../interfaces/map.service';
import {MapUiState} from '../../../state/map/states/map-ui.state';
import {selectMapUiState} from '../../../state/map/reducers/map-ui.reducer';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss']
})
export class MapControlsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scaleBarContainer', {static: true}) private scaleBarContainerRef!: ElementRef;

  public isMaxZoomedIn: boolean = false;
  public isMaxZoomedOut: boolean = false;
  public geolocationState: GeolocationState = initialGeolocationState;
  public mapUiState?: MapUiState;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly isMaxZoomedIn$ = this.store.select(selectIsMaxZoomedIn);
  private readonly isMaxZoomedOut$ = this.store.select(selectIsMaxZoomedOut);
  private readonly geolocationState$ = this.store.select(selectGeolocationState);
  private readonly mapUiState$ = this.store.select(selectMapUiState);

  constructor(private readonly store: Store, @Inject(MAP_SERVICE) private readonly mapService: MapService) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.mapService.assignScaleBarElement(this.scaleBarContainerRef.nativeElement);
  }

  public goToInitialExtent() {
    this.store.dispatch(MapConfigActions.resetExtent());
  }

  public handleZoom(zoomType: ZoomType) {
    this.store.dispatch(MapConfigActions.changeZoom({zoomType}));
  }

  public locateClient() {
    this.store.dispatch(GeolocationActions.startLocationRequest());
  }

  private initSubscriptions() {
    this.subscriptions.add(this.isMaxZoomedIn$.pipe(tap((value) => (this.isMaxZoomedIn = value))).subscribe());
    this.subscriptions.add(this.isMaxZoomedOut$.pipe(tap((value) => (this.isMaxZoomedOut = value))).subscribe());
    this.subscriptions.add(this.geolocationState$.pipe(tap((value) => (this.geolocationState = value))).subscribe());
    this.subscriptions.add(this.mapUiState$.pipe(tap((value) => (this.mapUiState = value))).subscribe());
  }
}
