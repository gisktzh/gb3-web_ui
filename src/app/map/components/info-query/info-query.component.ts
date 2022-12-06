import {Component, OnInit} from '@angular/core';
import {selectLegendItems, selectVisible} from '../../../core/state/map/reducers/legend.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectInfoQueryState, selectLoadingState} from '../../../core/state/map/reducers/info-query.reducer';
import {InfoQueryActions} from '../../../core/state/map/actions/info-query.actions';

@Component({
  selector: 'info-query',
  templateUrl: './info-query.component.html',
  styleUrls: ['./info-query.component.scss']
})
export class InfoQueryComponent implements OnInit {
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly subscriptions = new Subscription();
  public loadingState: string | undefined;
  public isVisible: boolean = false;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap(async (value) => {
            this.loadingState = value;
            if (value) {
              this.isVisible = true;
              console.log('load info');
            }
          })
        )
        .subscribe()
    );
  }

  public close() {
    this.isVisible = false;
    this.store.dispatch(InfoQueryActions.clearInfoQueryContent());
  }
}
