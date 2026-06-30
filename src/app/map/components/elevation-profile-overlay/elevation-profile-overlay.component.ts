import {Component, computed, inject} from '@angular/core';
import {selectIsElevationProfileOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectData, selectLoadingState} from '../../../state/map/reducers/elevation-profile.reducer';
import {SwisstopoApiService} from '../../../shared/services/apis/swisstopo/swisstopo-api.service';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {ElevationProfileChartComponent} from './elevation-profile-chart/elevation-profile-chart.component';
import {ElevationProfileStatisticsComponent} from './elevation-profile-statistics/elevation-profile-statistics.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'elevation-profile-overlay',
  templateUrl: './elevation-profile-overlay.component.html',
  styleUrls: ['./elevation-profile-overlay.component.scss'],
  imports: [
    MapOverlayComponent,
    LoadingAndProcessBarComponent,
    ElevationProfileChartComponent,
    ElevationProfileStatisticsComponent,
    MatButton,
    MatIcon,
    MatDivider,
  ],
})
export class ElevationProfileOverlayComponent {
  private readonly store = inject(Store);
  private readonly swisstopoApiService = inject(SwisstopoApiService);

  public readonly isVisible = this.store.selectSignal(selectIsElevationProfileOverlayVisible);
  public readonly elevationProfileData = this.store.selectSignal(selectData);
  public readonly loadingState = this.store.selectSignal(selectLoadingState);
  public readonly downloadCsvUrl = computed(() => {
    return this.swisstopoApiService.createDownloadLinkUrl(this.elevationProfileData());
  });

  public close() {
    this.store.dispatch(MapUiActions.setElevationProfileOverlayVisibility({isVisible: false}));
  }
}
