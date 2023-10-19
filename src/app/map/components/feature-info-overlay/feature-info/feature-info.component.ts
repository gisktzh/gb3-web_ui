import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectFeatureInfoQueryLoadingState} from 'src/app/state/map/selectors/feature-info-query-loading-state.selector';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {GeneralInfoResponse} from '../../../../shared/interfaces/general-info.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {selectData} from '../../../../state/map/reducers/general-info.reducer';
import {selectFeatureInfosForDisplay} from '../../../../state/map/selectors/feature-info-result-display.selector';

@Component({
  selector: 'feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss'],
})
export class FeatureInfoComponent implements OnInit, OnDestroy {
  @Input() public showInteractiveElements: boolean = true;

  public loadingState: LoadingState = undefined;
  public featureInfoData: FeatureInfoResultDisplay[] = [];
  public generalInfoData?: GeneralInfoResponse;

  private readonly loadingState$ = this.store.select(selectFeatureInfoQueryLoadingState);
  private readonly featureInfoData$ = this.store.select(selectFeatureInfosForDisplay);
  private readonly generalInfoData$ = this.store.select(selectData);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public trackById(index: number, item: FeatureInfoResultDisplay): string {
    return item.id;
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.featureInfoData$.pipe(tap((value) => (this.featureInfoData = value))).subscribe());
    this.subscriptions.add(this.generalInfoData$.pipe(tap((value) => (this.generalInfoData = value))).subscribe());
  }
}
