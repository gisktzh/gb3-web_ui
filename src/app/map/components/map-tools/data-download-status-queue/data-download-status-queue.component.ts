import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {LayerCatalogActions} from '../../../../state/map/actions/layer-catalog.actions';
import {OrderStatusJob} from '../../../../shared/interfaces/geoshop-order-status.interface';
import {selectIncompleteOrderStatusJobs} from '../../../../state/map/selectors/incomplete-order-status-jobs.selector';
import {DataDownloadOrderStatusJobActions} from '../../../../state/map/actions/data-download-order-status-job.actions';

@Component({
  selector: 'data-download-status-queue',
  templateUrl: './data-download-status-queue.component.html',
  styleUrls: ['./data-download-status-queue.component.scss'],
  standalone: false,
})
export class DataDownloadStatusQueueComponent implements OnInit, OnDestroy {
  public isMinimized = false;
  public statusJobs: OrderStatusJob[] = [];

  private readonly statusJobs$ = this.store.select(selectIncompleteOrderStatusJobs);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {
    this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleIsMinimized() {
    this.isMinimized = !this.isMinimized;
  }

  public trackById(index: number, item: OrderStatusJob): string {
    return item.id;
  }

  public downloadOrder(orderId: string) {
    this.removeOrder(orderId);
  }

  public removeFailedOrder(orderId: string) {
    this.removeOrder(orderId);
  }

  private removeOrder(orderId: string) {
    this.store.dispatch(DataDownloadOrderStatusJobActions.completeOrderStatus({orderId}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.statusJobs$.pipe(tap((statusJobs) => (this.statusJobs = statusJobs))).subscribe());
  }
}
