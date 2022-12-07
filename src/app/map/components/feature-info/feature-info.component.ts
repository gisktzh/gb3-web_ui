import {Component, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../../../core/state/map/reducers/feature-info.reducer';
import {FeatureInfoActions} from '../../../core/state/map/actions/feature-info.actions';

@Component({
  selector: 'feature-info',
  templateUrl: './feature-info.component.html',
  styleUrls: ['./feature-info.component.scss']
})
export class FeatureInfoComponent implements OnInit {
  public loadingState: string | undefined;
  public isVisible: boolean = false;
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
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
  }
  private updateVisibility(loadingState: string | undefined) {
    this.isVisible = loadingState === 'loading' || loadingState === 'loaded';
  }
  public close() {
    this.store.dispatch(FeatureInfoActions.clearFeatureInfoContent());
  }
}
