import {Component, inject, computed} from '@angular/core';
import {Store} from '@ngrx/store';
import {GeolocationActions} from 'src/app/state/map/actions/geolocation.actions';
import {selectQueryLegends} from 'src/app/state/map/selectors/query-legends.selector';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {selectGeolocationState} from '../../../../state/map/reducers/geolocation.reducer';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';

@Component({
  selector: 'map-tools-mobile',
  templateUrl: './map-tools-mobile.component.html',
  styleUrls: ['./map-tools-mobile.component.scss'],
  imports: [MatIconButton, MatTooltip, MatIcon, MatDivider, LoadingAndProcessBarComponent],
})
export class MapToolsMobileComponent {
  private readonly store = inject(Store);

  public readonly geolocationState = this.store.selectSignal(selectGeolocationState);
  public readonly currentActiveMapItems = this.store.selectSignal(selectQueryLegends);
  public readonly numberOfQueryLegends = computed(() => this.currentActiveMapItems().length);

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
}
