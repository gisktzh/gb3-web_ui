import {provideMockActions} from '@ngrx/effects/testing';
import {discardPeriodicTasks, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {EMPTY, Observable, of, Subscription, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {ConfigService} from '../../../shared/services/config.service';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {OrderStatusCouldNotBeSent, OrderStatusWasAborted} from '../../../shared/errors/data-download.errors';
import {OrderStatus, OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';
import {DataDownloadConfig} from '../../../shared/interfaces/data-download-config.interface';
import {DataDownloadOrderStatusJobEffects} from './data-download-order-status-job.effects';
import {selectStatusJobs} from '../reducers/data-download-order-status-job.reducer';
import {DataDownloadOrderStatusJobActions} from '../actions/data-download-order-status-job.actions';
import {catchError} from 'rxjs/operators';

describe('DataDownloadOrderStatusJobEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadOrderStatusJobEffects;
  let geoshopApiService: GeoshopApiService;
  let configService: ConfigService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DataDownloadOrderStatusJobEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DataDownloadOrderStatusJobEffects);
    store = TestBed.inject(MockStore);
    geoshopApiService = TestBed.inject(GeoshopApiService);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('periodicallyCheckOrderStatus$', () => {
    const orderTitle = 'stormtrooper';
    const orderId = 'ST-1337';
    const orderStatus: OrderStatus = {
      orderId,
      internalId: 123,
      submittedDateString: 'may the force',
      finishedDateString: 'be with you',
      status: {
        type: 'working',
      },
    };
    const orderStatusJob: OrderStatusJob = {
      id: orderId,
      title: orderTitle,
      loadingState: 'loaded',
      isCancelled: false,
      isAborted: false,
      isCompleted: false,
      consecutiveErrorsCount: 0,
      status: orderStatus,
    };
    const dataDownloadConfig: DataDownloadConfig = {
      defaultOrderSrs: 'lv95',
      initialPollingDelay: 0,
      maximumNumberOfConsecutiveStatusJobErrors: 1,
      pollingInterval: 1000,
    };

    it('dispatches DataDownloadOrderStatusJobActions.setOrderStatusResponse() at least once without an error after requesting an order status', fakeAsync(() => {
      store.overrideSelector(selectStatusJobs, []);
      spyOnProperty(configService, 'dataDownloadConfig', 'get').and.returnValue(dataDownloadConfig);
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'checkOrderStatus').and.returnValue(of(orderStatus));
      const subscription = new Subscription();

      const expectedAction = DataDownloadOrderStatusJobActions.setOrderStatusResponse({orderStatus});

      let newAction: Action | undefined;
      actions$ = of(DataDownloadOrderStatusJobActions.requestOrderStatus({orderTitle, orderId}));
      subscription.add(effects.periodicallyCheckOrderStatus$.subscribe((action) => (newAction = action)));
      tick();

      expect(geoshopApiServiceSpy).toHaveBeenCalledOnceWith(orderId);
      expect(newAction).toBeDefined();
      expect(newAction).toEqual(expectedAction);
      subscription.unsubscribe();
    }));

    it('dispatches DataDownloadOrderStatusJobActions.setOrderStatusError() at least once with an error after requesting an order status', fakeAsync(() => {
      store.overrideSelector(selectStatusJobs, []);
      spyOnProperty(configService, 'dataDownloadConfig', 'get').and.returnValue(dataDownloadConfig);
      const error = new Error('noooooooooooooo!!!');
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'checkOrderStatus').and.returnValue(throwError(() => error));
      const subscription = new Subscription();

      const expectedAction = DataDownloadOrderStatusJobActions.setOrderStatusError({
        error,
        orderId,
        maximumNumberOfConsecutiveStatusJobErrors: 1,
      });

      let newAction: Action | undefined;
      actions$ = of(DataDownloadOrderStatusJobActions.requestOrderStatus({orderTitle, orderId}));
      subscription.add(effects.periodicallyCheckOrderStatus$.subscribe((action) => (newAction = action)));
      tick();

      expect(geoshopApiServiceSpy).toHaveBeenCalledOnceWith(orderId);
      expect(newAction).toBeDefined();
      expect(newAction).toEqual(expectedAction);
      subscription.unsubscribe();
    }));

    it('dispatches nothing if the status job has the status type success', fakeAsync(() => {
      const orderStatusJobWithStatusSuccess: OrderStatusJob = {
        ...orderStatusJob,
        status: {...orderStatus, status: {type: 'success'}},
      };
      store.overrideSelector(selectStatusJobs, [orderStatusJobWithStatusSuccess]);
      spyOnProperty(configService, 'dataDownloadConfig', 'get').and.returnValue(dataDownloadConfig);
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'checkOrderStatus').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadOrderStatusJobActions.requestOrderStatus({orderTitle, orderId}));
      effects.periodicallyCheckOrderStatus$.subscribe((action) => (newAction = action));
      tick();

      expect(geoshopApiServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
      discardPeriodicTasks();
    }));

    it('dispatches nothing if the status job has the status type failure', fakeAsync(() => {
      const orderStatusJobWithStatusFailure: OrderStatusJob = {
        ...orderStatusJob,
        status: {...orderStatus, status: {type: 'failure'}},
      };
      store.overrideSelector(selectStatusJobs, [orderStatusJobWithStatusFailure]);
      spyOnProperty(configService, 'dataDownloadConfig', 'get').and.returnValue(dataDownloadConfig);
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'checkOrderStatus').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadOrderStatusJobActions.requestOrderStatus({orderTitle, orderId}));
      effects.periodicallyCheckOrderStatus$.subscribe((action) => (newAction = action));
      tick();

      expect(geoshopApiServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
      discardPeriodicTasks();
    }));

    it('dispatches nothing if the status job was aborted', fakeAsync(() => {
      const abortedOrderStatusJob: OrderStatusJob = {
        ...orderStatusJob,
        isAborted: true,
      };
      store.overrideSelector(selectStatusJobs, [abortedOrderStatusJob]);
      spyOnProperty(configService, 'dataDownloadConfig', 'get').and.returnValue(dataDownloadConfig);
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'checkOrderStatus').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadOrderStatusJobActions.requestOrderStatus({orderTitle, orderId}));
      effects.periodicallyCheckOrderStatus$.subscribe((action) => (newAction = action));
      tick();

      expect(geoshopApiServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
      discardPeriodicTasks();
    }));

    it('dispatches nothing if the status job was cancelled', fakeAsync(() => {
      const cancelledOrderStatusJob: OrderStatusJob = {
        ...orderStatusJob,
        isCancelled: true,
      };
      store.overrideSelector(selectStatusJobs, [cancelledOrderStatusJob]);
      spyOnProperty(configService, 'dataDownloadConfig', 'get').and.returnValue(dataDownloadConfig);
      const geoshopApiServiceSpy = spyOn(geoshopApiService, 'checkOrderStatus').and.callThrough();

      let newAction;
      actions$ = of(DataDownloadOrderStatusJobActions.requestOrderStatus({orderTitle, orderId}));
      effects.periodicallyCheckOrderStatus$.subscribe((action) => (newAction = action));
      tick();

      expect(geoshopApiServiceSpy).not.toHaveBeenCalled();
      expect(newAction).toBeUndefined();
      discardPeriodicTasks();
    }));
  });

  describe('throwOrderStatusError$', () => {
    it('throws a OrderStatusCouldNotBeSent error after setting an order status error', (done: DoneFn) => {
      const originalError = new Error('noooooooooooooo!!!');
      store.overrideSelector(selectStatusJobs, []);

      const expectedError = new OrderStatusCouldNotBeSent(originalError);

      actions$ = of(
        DataDownloadOrderStatusJobActions.setOrderStatusError({
          error: originalError,
          orderId: 'stormtrooper',
          maximumNumberOfConsecutiveStatusJobErrors: 3,
        }),
      );
      effects.throwOrderStatusError$
        .pipe(
          catchError((error: unknown) => {
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('throwOrderStatusRefreshAbortError$', () => {
    const orderTitle = 'stormtrooper';
    const orderId = 'ST-1337';
    const orderStatus: OrderStatus = {
      orderId,
      internalId: 123,
      submittedDateString: 'may the force',
      finishedDateString: 'be with you',
      status: {
        type: 'working',
      },
    };
    const orderStatusJob: OrderStatusJob = {
      id: orderId,
      title: orderTitle,
      loadingState: 'loaded',
      isCancelled: false,
      isAborted: false,
      isCompleted: false,
      consecutiveErrorsCount: 0,
      status: orderStatus,
    };

    it('throws a OrderStatusWasAborted error after setting an order status error where isAborted is true', (done: DoneFn) => {
      const originalError = new Error('noooooooooooooo!!!');
      const abortedOrderStatusJob: OrderStatusJob = {
        ...orderStatusJob,
        isAborted: true,
      };
      store.overrideSelector(selectStatusJobs, [abortedOrderStatusJob]);

      const expectedError = new OrderStatusWasAborted(originalError);

      actions$ = of(
        DataDownloadOrderStatusJobActions.setOrderStatusError({
          error: originalError,
          orderId,
          maximumNumberOfConsecutiveStatusJobErrors: 3,
        }),
      );
      effects.throwOrderStatusRefreshAbortError$
        .pipe(
          catchError((error: unknown) => {
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });

    it('dispatches nothing if the order is not aborted', fakeAsync(() => {
      const error = new Error('noooooooooooooo!!!');
      const notAbortedOrderStatusJob: OrderStatusJob = {
        ...orderStatusJob,
        isAborted: false,
      };
      store.overrideSelector(selectStatusJobs, [notAbortedOrderStatusJob]);

      let newAction;
      actions$ = of(DataDownloadOrderStatusJobActions.setOrderStatusError({error, orderId, maximumNumberOfConsecutiveStatusJobErrors: 3}));
      effects.throwOrderStatusRefreshAbortError$.subscribe((action) => (newAction = action));
      tick();

      expect(newAction).toBeUndefined();
    }));
  });
});
