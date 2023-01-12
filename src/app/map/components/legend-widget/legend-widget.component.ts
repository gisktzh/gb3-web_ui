import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLegendItems, selectLoadingState} from '../../../core/state/map/reducers/legend.reducer';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';
import {Legend} from '../../../shared/models/gb3-api.interfaces';
import {LoadingState} from '../../../shared/enums/loading-state';

@Component({
  selector: 'legend-widget',
  templateUrl: './legend-widget.component.html',
  styleUrls: ['./legend-widget.component.scss']
})
export class LegendWidgetComponent implements OnInit, OnDestroy {
  @Output() public printLegendEvent = new EventEmitter<void>();

  public readonly LOADING_STATE = LoadingState;

  public isVisible = false;
  public legendItems: Legend[] = [];
  public loadingState = LoadingState.UNDEFINED;

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly legendItems$ = this.store.select(selectLegendItems);
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
    this.isVisible = loadingState !== LoadingState.UNDEFINED;
  }
}
