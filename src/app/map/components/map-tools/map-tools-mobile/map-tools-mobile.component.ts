import {Component, OnInit, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {GeolocationActions} from 'src/app/state/map/actions/geolocation.actions';
import {selectQueryLegends} from 'src/app/state/map/selectors/query-legends.selector';
import {GeolocationState} from 'src/app/state/map/states/geolocation.state';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {initialState as initialGeolocationState, selectGeolocationState} from '../../../../state/map/reducers/geolocation.reducer';

@Component({
  selector: 'map-tools-mobile',
  templateUrl: './map-tools-mobile.component.html',
  styleUrls: ['./map-tools-mobile.component.scss'],
  standalone: false,
})
export class MapToolsMobileComponent implements OnInit, OnDestroy {
  public numberOfQueryLegends: number = 0;
  public geolocationState: GeolocationState = initialGeolocationState;

  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly geolocationState$ = this.store.select(selectGeolocationState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public showShareLink() {
    this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'share-link'}));
  }

  public showLegend() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
  }

  public locateClient() {
    this.store.dispatch(GeolocationActions.startLocationRequest());
  }

  public toggleBasemapSelection() {
    this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'basemap'}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.queryLegends$
        .pipe(
          tap((currentActiveMapItems) => {
            this.numberOfQueryLegends = currentActiveMapItems.length;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.geolocationState$.pipe(tap((value) => (this.geolocationState = value))).subscribe());
  }
}
