import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {selectIsElevationProfileOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectData, selectLoadingState} from '../../../state/map/reducers/elevation-profile.reducer';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';

@Component({
  selector: 'elevation-profile-overlay',
  templateUrl: './elevation-profile-overlay.component.html',
  styleUrls: ['./elevation-profile-overlay.component.scss'],
})
export class ElevationProfileOverlayComponent implements OnInit, OnDestroy {
  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;

  public isVisible: boolean = false;
  public elevationProfileData?: ElevationProfileData;
  public loadingState: LoadingState;

  private readonly isElevationProfileOverlayVisible$ = this.store.select(selectIsElevationProfileOverlayVisible);
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly elevationProfileData$ = this.store.select(selectData);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.setElevationProfileOverlayVisibility({isVisible: false}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.elevationProfileData$.pipe(tap((value) => (this.elevationProfileData = value))).subscribe());
    this.subscriptions.add(this.isElevationProfileOverlayVisible$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
  }
}
