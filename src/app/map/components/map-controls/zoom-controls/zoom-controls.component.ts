import {Component, Input} from '@angular/core';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {ZoomType} from '../../../../shared/types/zoom.type';
import {Store} from '@ngrx/store';
import {GeolocationState} from '../../../../state/map/states/geolocation.state';
import {initialState as initialGeolocationState, selectGeolocationState} from '../../../../state/map/reducers/geolocation.reducer';
import {MapUiState} from '../../../../state/map/states/map-ui.state';
import {Subscription, tap} from 'rxjs';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../../../../state/map/reducers/map-config.reducer';
import {selectMapUiState} from '../../../../state/map/reducers/map-ui.reducer';
import {GeolocationActions} from '../../../../state/map/actions/geolocation.actions';
import {MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import {ConfigService} from 'src/app/shared/services/config.service';
import {toolTipFactoryMapToolsAndControls} from 'src/app/shared/configs/tooltip.config';

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

  private readonly subscriptions: Subscription = new Subscription();
  private readonly isMaxZoomedIn$ = this.store.select(selectIsMaxZoomedIn);
  private readonly isMaxZoomedOut$ = this.store.select(selectIsMaxZoomedOut);
  private readonly geolocationState$ = this.store.select(selectGeolocationState);
  private readonly mapUiState$ = this.store.select(selectMapUiState);

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
  }
}
