import {Component, Input} from '@angular/core';
import {MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {toolTipFactoryMapToolsAndControls} from 'src/app/shared/factories/tooltip-map-tools-and-controls.factory';
import {ConfigService} from 'src/app/shared/services/config.service';
import {ScreenHeight} from 'src/app/shared/types/screen-height-type';
import {selectScreenHeight} from 'src/app/state/app/reducers/app-layout.reducer';
import {ZoomType} from '../../../../shared/types/zoom.type';
import {GeolocationActions} from '../../../../state/map/actions/geolocation.actions';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {initialState as initialGeolocationState, selectGeolocationState} from '../../../../state/map/reducers/geolocation.reducer';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../../../../state/map/reducers/map-config.reducer';
import {selectMapUiState} from '../../../../state/map/reducers/map-ui.reducer';
import {GeolocationState} from '../../../../state/map/states/geolocation.state';
import {MapUiState} from '../../../../state/map/states/map-ui.state';

@Component({
  selector: 'zoom-controls',
  templateUrl: './zoom-controls.component.html',
  styleUrls: ['./zoom-controls.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useFactory: toolTipFactoryMapToolsAndControls, deps: [ConfigService]}],
})
export class ZoomControlsComponent {
  @Input() public showLocateMeButton!: boolean;

  public isMaxZoomedIn: boolean = false;
  public isMaxZoomedOut: boolean = false;
  public geolocationState: GeolocationState = initialGeolocationState;
  public mapUiState?: MapUiState;
  public screenHeight: ScreenHeight = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly isMaxZoomedIn$ = this.store.select(selectIsMaxZoomedIn);
  private readonly isMaxZoomedOut$ = this.store.select(selectIsMaxZoomedOut);
  private readonly geolocationState$ = this.store.select(selectGeolocationState);
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly screenHeight$ = this.store.select(selectScreenHeight);

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    this.subscriptions.add(this.screenHeight$.pipe(tap((value) => (this.screenHeight = value))).subscribe());
  }
}
