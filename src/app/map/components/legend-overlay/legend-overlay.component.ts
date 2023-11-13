import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {selectLoadingState} from '../../../state/map/reducers/legend.reducer';
import {selectIsLegendOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {OverlayPrintActions} from '../../../state/map/actions/overlay-print-actions';
import {selectLegendPrintState} from '../../../state/map/reducers/overlay-print.reducer';

@Component({
  selector: 'legend-overlay',
  templateUrl: './legend-overlay.component.html',
  styleUrls: ['./legend-overlay.component.scss'],
})
export class LegendOverlayComponent implements OnInit, OnDestroy {
  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;

  public isVisible = false;
  public loadingState: LoadingState;
  public printLoadingState: LoadingState;
  public screenMode: ScreenMode = 'mobile';

  private readonly isLegendOverlayVisible$ = this.store.select(selectIsLegendOverlayVisible);
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly printLoadingState$ = this.store.select(selectLegendPrintState);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: false}));
  }

  public print() {
    this.store.dispatch(OverlayPrintActions.sendPrintRequest({overlay: 'legend'}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.printLoadingState$.pipe(tap((value) => (this.printLoadingState = value))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(this.isLegendOverlayVisible$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
  }
}
