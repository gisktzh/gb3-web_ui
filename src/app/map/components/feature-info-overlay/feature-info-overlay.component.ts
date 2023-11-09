import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectIsFeatureInfoOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {selectFeatureInfoQueryLoadingState} from '../../../state/map/selectors/feature-info-query-loading-state.selector';
import {selectFeatureInfosForDisplay} from '../../../state/map/selectors/feature-info-result-display.selector';
import {selectFeatureInfoPrintState} from '../../../state/map/reducers/overlay-print.reducer';
import {OverlayPrintActions} from '../../../state/map/actions/overlay-print-actions';

@Component({
  selector: 'feature-info-overlay',
  templateUrl: './feature-info-overlay.component.html',
  styleUrls: ['./feature-info-overlay.component.scss'],
})
export class FeatureInfoOverlayComponent implements OnInit, OnDestroy {
  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;

  public isVisible: boolean = false;
  public featureInfoData: FeatureInfoResultDisplay[] = [];
  public loadingState: LoadingState;
  public printLoadingState: LoadingState;

  private readonly isFeatureInfoOverlayVisible$ = this.store.select(selectIsFeatureInfoOverlayVisible);
  private readonly loadingState$ = this.store.select(selectFeatureInfoQueryLoadingState);
  private readonly featureInfoData$ = this.store.select(selectFeatureInfosForDisplay);
  private readonly printLoadingState$ = this.store.select(selectFeatureInfoPrintState);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
  }

  public print() {
    this.store.dispatch(OverlayPrintActions.print({overlay: 'featureInfo'}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.featureInfoData$.pipe(tap((value) => (this.featureInfoData = value))).subscribe());
    this.subscriptions.add(this.isFeatureInfoOverlayVisible$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
    this.subscriptions.add(this.printLoadingState$.pipe(tap((loadingState) => (this.printLoadingState = loadingState))).subscribe());
  }
}
