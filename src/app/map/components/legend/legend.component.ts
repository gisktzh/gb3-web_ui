import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../../../state/map/reducers/legend.reducer';
import {LegendActions} from '../../../state/map/actions/legend.actions';
import {LoadingState} from '../../../shared/types/loading-state';
import {LegendDisplay} from '../../../shared/interfaces/legend.interface';
import {selectDetailedLegends} from '../../../state/map/selectors/legend.selector';

@Component({
  selector: 'legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit, OnDestroy {
  @Output() public printLegendEvent = new EventEmitter<void>();

  public isVisible = false;
  public legendItems: LegendDisplay[] = [];
  public loadingState: LoadingState = 'undefined';

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly legendItems$ = this.store.select(selectDetailedLegends);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(LegendActions.hideLegend());
  }

  public print() {
    this.printLegendEvent.emit();
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
      this.legendItems$
        .pipe(
          tap(async (value) => {
            this.legendItems = value;
          })
        )
        .subscribe()
    );
  }

  private updateVisibility(loadingState: LoadingState) {
    this.isVisible = loadingState !== 'undefined';
  }
}
