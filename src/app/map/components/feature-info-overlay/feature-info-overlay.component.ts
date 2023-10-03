import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {selectFeatureInfosForDisplay} from '../../../state/map/selectors/feature-info-result-display.selector';
import {selectFeatureInfoQueryLoadingState} from '../../../state/map/selectors/feature-info-query-loading-state.selector';
import {selectGeneralInfoState} from '../../../state/map/reducers/general-info.reducer';
import {GeneralInfoResponse} from '../../../shared/interfaces/general-info.interface';
import {selectIsFeatureInfoOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'feature-info-overlay',
  templateUrl: './feature-info-overlay.component.html',
  styleUrls: ['./feature-info-overlay.component.scss'],
})
export class FeatureInfoOverlayComponent implements OnInit, OnDestroy {
  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;
  @Output() public readonly printFeatureInfoEvent = new EventEmitter<void>();

  public isVisible: boolean = false;
  public featureInfoData: FeatureInfoResultDisplay[] = [];
  public generalInfoData?: GeneralInfoResponse;
  public loadingState: LoadingState = 'undefined';

  private readonly isFeatureInfoOverlayVisible$ = this.store.select(selectIsFeatureInfoOverlayVisible);
  private readonly loadingState$ = this.store.select(selectFeatureInfoQueryLoadingState);
  private readonly featureInfoData$ = this.store.select(selectFeatureInfosForDisplay);
  private readonly generalInfoData$ = this.store.select(selectGeneralInfoState);
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
    this.printFeatureInfoEvent.emit();
  }

  public trackById(index: number, item: FeatureInfoResultDisplay): string {
    return item.id;
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.featureInfoData$.pipe(tap((value) => (this.featureInfoData = value))).subscribe());
    this.subscriptions.add(this.generalInfoData$.pipe(tap((value) => (this.generalInfoData = value.data))).subscribe());
    this.subscriptions.add(this.isFeatureInfoOverlayVisible$.pipe(tap((isVisible) => (this.isVisible = isVisible))).subscribe());
  }
}
