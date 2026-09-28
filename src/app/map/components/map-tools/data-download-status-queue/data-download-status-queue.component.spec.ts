import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DataDownloadOrderStatusJobActions} from '../../../../state/map/actions/data-download-order-status-job.actions';
import {LayerCatalogActions} from '../../../../state/map/actions/layer-catalog.actions';
import {DataDownloadStatusQueueComponent} from './data-download-status-queue.component';

describe('DataDownloadStatusQueueComponent', () => {
  let fixture: ComponentFixture<DataDownloadStatusQueueComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [DataDownloadStatusQueueComponent], providers: [provideMockStore()]})
      .overrideComponent(DataDownloadStatusQueueComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('loads catalog data when created and exposes minimization state', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(DataDownloadStatusQueueComponent);
    expect(dispatch).toHaveBeenCalledWith(LayerCatalogActions.loadLayerCatalog());
    fixture.componentInstance.toggleIsMinimized();
    expect(fixture.componentInstance.isMinimized()).toBe(true);
  });

  it('completes downloaded and failed jobs', () => {
    fixture = TestBed.createComponent(DataDownloadStatusQueueComponent);
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.downloadOrder('order-1');
    fixture.componentInstance.removeFailedOrder('order-2');
    expect(dispatch).toHaveBeenCalledWith(DataDownloadOrderStatusJobActions.completeOrderStatus({orderId: 'order-1'}));
    expect(dispatch).toHaveBeenCalledWith(DataDownloadOrderStatusJobActions.completeOrderStatus({orderId: 'order-2'}));
  });
});
