import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {GeolocationActions} from 'src/app/state/map/actions/geolocation.actions';
import {selectQueryLegends} from 'src/app/state/map/selectors/query-legends.selector';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'map-tools-mobile',
  templateUrl: './map-tools-mobile.component.html',
  styleUrls: ['./map-tools-mobile.component.scss'],
})
export class MapToolsMobileComponent {
  public numberOfQueryLegends: number = 0;

  private readonly queryLegends$ = this.store.select(selectQueryLegends);

  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public showShareLink() {
    this.store.dispatch(MapUiActions.showShareLinkDialog());
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
  }
}
