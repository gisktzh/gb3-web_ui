import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {Subscription, tap} from 'rxjs';
import {selectOrder, selectSavingState} from '../../../../state/map/reducers/data-download-order.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Order} from '../../../../shared/interfaces/geoshop-order.interface';

@Component({
  selector: 'data-download-dialog',
  templateUrl: './data-download-dialog.component.html',
  styleUrls: ['./data-download-dialog.component.scss'],
})
export class DataDownloadDialogComponent implements OnInit, OnDestroy {
  public order?: Order;
  public savingState: LoadingState;

  private readonly order$ = this.store.select(selectOrder);
  private readonly savingState$ = this.store.select(selectSavingState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public download() {}

  public cancel() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  private initSubscriptions() {
    this.subscriptions.add(this.order$.pipe(tap((order) => (this.order = order))).subscribe());
    this.subscriptions.add(this.savingState$.pipe(tap((savingState) => (this.savingState = savingState))).subscribe());
  }
}
