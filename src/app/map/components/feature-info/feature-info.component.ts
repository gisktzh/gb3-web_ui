import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectData, selectLoadingState} from '../../../core/state/map/reducers/feature-info.reducer';
import {FeatureInfoActions} from '../../../core/state/map/actions/feature-info.actions';
import {FeatureInfoResult} from '../../../shared/models/gb3-api.interfaces';
import {LoadingState} from '../../../shared/enums/loading-state';
import {PrintService} from '../../services/print.service';

@Component({
  selector: 'feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss']
})
export class FeatureInfoComponent implements OnInit, OnDestroy {
  public isVisible: boolean = false;
  public featureInfoData: FeatureInfoResult[] = [];
  private loadingState: LoadingState | undefined;
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly featureInfoData$ = this.store.select(selectData);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store, private readonly printService: PrintService) {}

  public get isLoading() {
    return this.loadingState === LoadingState.LOADING;
  }

  public get isLoaded() {
    return this.loadingState === LoadingState.LOADED;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(FeatureInfoActions.clearFeatureInfoContent());
  }

  public printInfo() {
    this.printService.printFeatureInfo();
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

  private updateVisibility(loadingState: LoadingState | undefined) {
    this.isVisible = loadingState !== undefined;
  }
}
