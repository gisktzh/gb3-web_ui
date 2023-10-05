import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {selectFeatureInfoQueryLoadingState} from 'src/app/state/map/selectors/feature-info-query-loading-state.selector';
import {selectFeatureInfosForDisplay} from '../../../../state/map/selectors/feature-info-result-display.selector';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {GeneralInfoResponse} from '../../../../shared/interfaces/general-info.interface';
import {selectGeneralInfoState} from '../../../../state/map/reducers/general-info.reducer';

@Component({
  selector: 'feature-infos-item',
  templateUrl: './feature-infos-item.component.html',
  styleUrls: ['./feature-infos-item.component.scss'],
})
export class FeatureInfosItemComponent implements OnInit, OnDestroy {
  public loadingState: LoadingState = undefined;
  public featureInfoData: FeatureInfoResultDisplay[] = [];
  public generalInfoData?: GeneralInfoResponse;

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

  public trackById(index: number, item: FeatureInfoResultDisplay): string {
    return item.id;
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.featureInfoData$.pipe(tap((value) => (this.featureInfoData = value))).subscribe());
    this.subscriptions.add(this.generalInfoData$.pipe(tap((value) => (this.generalInfoData = value.data))).subscribe());
  }
}
