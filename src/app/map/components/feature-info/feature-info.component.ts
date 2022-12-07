import {Component, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectData, selectLoadingState} from '../../../core/state/map/reducers/feature-info.reducer';
import {FeatureInfoActions} from '../../../core/state/map/actions/feature-info.actions';
import {FeatureInfoResult} from '../../../shared/models/gb3-api.interfaces';

@Component({
  selector: 'feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss']
})
export class FeatureInfoComponent implements OnInit {
  public loadingState: string | undefined;
  public isVisible: boolean = false;
  public featureInfoData: FeatureInfoResult[] = [];
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly featureInfoData$ = this.store.select(selectData);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.initSubscriptions();
  }

  public close() {
    this.store.dispatch(FeatureInfoActions.clearFeatureInfoContent());
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap(async (value) => {
            this.loadingState = value;
            this.updateVisibility(value);
          })
        )
        .subscribe()
    );
    this.subscriptions.add(
      this.featureInfoData$
        .pipe(
          tap(async (value) => {
            this.featureInfoData = value;
          })
        )
        .subscribe()
    );
  }

  private updateVisibility(loadingState: string | undefined) {
    this.isVisible = loadingState === 'loading' || loadingState === 'loaded';
  }
}
