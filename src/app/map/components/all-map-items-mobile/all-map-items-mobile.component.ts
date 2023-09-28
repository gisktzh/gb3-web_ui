import {Component, OnInit, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectShowMapManagementMobile} from 'src/app/state/map/reducers/map-ui.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {Subscription, tap} from 'rxjs';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';

@Component({
  selector: 'all-map-items-mobile',
  templateUrl: './all-map-items-mobile.component.html',
  styleUrls: ['./all-map-items-mobile.component.scss'],
})
export class AllMapItemsMobileComponent implements OnInit, OnDestroy {
  public isVisible: boolean = false;
  public screenMode: ScreenMode = 'mobile';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly showMapManagementMobile$ = this.store.select(selectShowMapManagementMobile);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.hideMapManagementMobile());
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.showMapManagementMobile$
        .pipe(
          tap((showMapManagementMobile) => {
            this.isVisible = showMapManagementMobile;
          }),
        )
        .subscribe(),
    );
  }
}
