import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectVisible} from '../../../core/state/map/reducers/legend.reducer';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';

@Component({
  selector: 'legend-widget',
  templateUrl: './legend-widget.component.html',
  styleUrls: ['./legend-widget.component.scss']
})
export class LegendWidgetComponent implements OnInit, OnDestroy {
  private readonly visibility$ = this.store.select(selectVisible);
  private readonly visibilitySubscription = new Subscription();
  public isVisible = false;

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.visibilitySubscription.add(
      this.visibility$
        .pipe(
          tap((value) => {
            this.isVisible = value;
          })
        )
        .subscribe()
    );
  }

  public ngOnDestroy() {
    this.visibilitySubscription.unsubscribe();
  }

  public close() {
    this.store.dispatch(LegendActions.toggleDisplay());
  }
}
