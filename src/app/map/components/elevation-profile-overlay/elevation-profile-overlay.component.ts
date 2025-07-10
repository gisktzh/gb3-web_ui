import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {selectIsElevationProfileOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectData, selectLoadingState} from '../../../state/map/reducers/elevation-profile.reducer';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';
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
export class ElevationProfileOverlayComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly swisstopoApiService = inject(SwisstopoApiService);

  public isVisible: boolean = false;
  public elevationProfileData?: ElevationProfileData;
  public loadingState: LoadingState;
  public downloadCsvUrl?: string;

  private readonly isElevationProfileOverlayVisible$ = this.store.select(selectIsElevationProfileOverlayVisible);
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly elevationProfileData$ = this.store.select(selectData);
  private readonly subscriptions = new Subscription();

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.setElevationProfileOverlayVisibility({isVisible: false}));
  }

  private createDownLoadLink(elevationProfileData: ElevationProfileData | undefined) {
    this.downloadCsvUrl = this.swisstopoApiService.createDownloadLinkUrl(elevationProfileData);
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(
      this.elevationProfileData$
        .pipe(
          tap((value) => {
            this.elevationProfileData = value;
            this.createDownLoadLink(value);
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.isElevationProfileOverlayVisible$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
  }
}
