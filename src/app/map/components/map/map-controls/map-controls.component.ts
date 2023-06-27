import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {ZoomType} from '../../../../shared/types/zoom-type';
import {Subscription, tap} from 'rxjs';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../../../../state/map/reducers/map-config.reducer';
import {GeolocationActions} from '../../../../state/map/actions/geolocation.actions';
import {initialState as initialGeolocationState, selectGeolocationState} from '../../../../state/map/reducers/geolocation.reducer';
import {GeolocationState} from '../../../../state/map/states/geolocation.state';
import {ToolActions} from '../../../../state/map/actions/tool.actions';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss']
})
export class MapControlsComponent implements OnInit, OnDestroy {
  public isMaxZoomedIn: boolean = false;
  public isMaxZoomedOut: boolean = false;
  public geolocationState: GeolocationState = initialGeolocationState;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly isMaxZoomedIn$ = this.store.select(selectIsMaxZoomedIn);
  private readonly isMaxZoomedOut$ = this.store.select(selectIsMaxZoomedOut);
  private readonly geolocationState$ = this.store.select(selectGeolocationState);

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

  public toggleLineMeasurement() {
    this.store.dispatch(ToolActions.toggle({tool: 'measure-line'}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.isMaxZoomedIn$.pipe(tap((value) => (this.isMaxZoomedIn = value))).subscribe());
    this.subscriptions.add(this.isMaxZoomedOut$.pipe(tap((value) => (this.isMaxZoomedOut = value))).subscribe());
    this.subscriptions.add(this.geolocationState$.pipe(tap((value) => (this.geolocationState = value))).subscribe());
  }
}
