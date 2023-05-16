import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../../../state/map/reducers/feature-info.reducer';
import {FeatureInfoActions} from '../../../state/map/actions/feature-info.actions';
import {LoadingState} from '../../../shared/types/loading-state';
import {FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {selectFeatureInfosForDisplay} from '../../../state/map/selectors/feature-info-result-display.selector';

@Component({
  selector: 'feature-info-overlay',
  templateUrl: './feature-info-overlay.component.html',
  styleUrls: ['./feature-info-overlay.component.scss']
})
export class FeatureInfoOverlayComponent implements OnInit, OnDestroy {
  @Output() public printFeatureInfoEvent = new EventEmitter<void>();

  public isVisible: boolean = false;
  public featureInfoData: FeatureInfoResultDisplay[] = [];
  public loadingState: LoadingState = 'undefined';

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly featureInfoData$ = this.store.select(selectFeatureInfosForDisplay);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(FeatureInfoActions.clearFeatureInfoContent());
  }

  public print() {
    this.printFeatureInfoEvent.emit();
  }

  public trackById(index: number, item: FeatureInfoResultDisplay): string {
    return item.id;
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

  private updateVisibility(loadingState: LoadingState) {
    this.isVisible = loadingState !== 'undefined';
  }
}
