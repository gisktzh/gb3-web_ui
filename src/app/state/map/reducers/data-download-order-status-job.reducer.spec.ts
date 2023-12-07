import {reducer} from './data-download-order-status-job.reducer';
import {OrderStatus, OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';
import {DataDownloadOrderStatusJobState} from '../states/data-download-order-status-job.state';
import {DataDownloadOrderStatusJobActions} from '../actions/data-download-order-status-job.actions';

describe('data download order reducer', () => {
  const existingStateStatusJobs: OrderStatusJob[] = [
    {
      id: '1',
      title: 'fire nation',
      loadingState: 'loaded',
      status: {
        orderId: 'fire nation attacks',
        status: {
          type: 'success',
        },
        submittedDateString: 'yes',
        finishedDateString: 'no',
        internalId: 1337,
      },
      consecutiveErrorsCount: 0,
      isCompleted: false,
      isAborted: false,
      isCancelled: false,
    },
    {
      id: '2',
      title: 'balance',
      loadingState: 'loading',
      status: {
        orderId: 'balance restored',
        status: {
          type: 'working',
          message: 'in process',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: '',
        internalId: 42,
      },
      consecutiveErrorsCount: 0,
      isCompleted: false,
      isAborted: false,
      isCancelled: false,
    },
    {
      id: '3',
      title: 'sokka',
      loadingState: 'error',
      status: {
        orderId: 'sokka is not hungry',
        status: {
          type: 'failure',
        },
        submittedDateString: 'always',
        finishedDateString: 'never',
        internalId: 42_1337,
      },
      consecutiveErrorsCount: 0,
      isCompleted: false,
      isAborted: false,
      isCancelled: false,
    },
  ];
  const errorMock: Error = new Error('oh no! anyway...');

  let existingState: DataDownloadOrderStatusJobState;

  beforeEach(() => {
    existingState = {
      statusJobs: existingStateStatusJobs,
    };
  });

  describe('requestOrderStatus', () => {
    it('creates a new status job and adds it to the list if it does not exist yet; keeps everything else', () => {
      const orderId = '4';
      const orderTitle = 'appa';

      const expectedNewStatusJob: OrderStatusJob = {
        id: orderId,
        title: orderTitle,
        loadingState: 'loading',
        consecutiveErrorsCount: 0,
        isCompleted: false,
        isAborted: false,
        isCancelled: false,
      };
      const expectedStatusJobs: OrderStatusJob[] = [...existingState.statusJobs, expectedNewStatusJob];

      const action = DataDownloadOrderStatusJobActions.requestOrderStatus({orderId, orderTitle});
      const state = reducer(existingState, action);

      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });

    it('updates an existing status job; keeps everything else', () => {
      const orderId = '4';
      const orderTitle = 'appa';
      const existingStatusJob: OrderStatusJob = {
        id: orderId,
        title: orderTitle,
        loadingState: 'error',
        consecutiveErrorsCount: 0,
        isCompleted: false,
        isAborted: false,
        isCancelled: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingState.statusJobs[1], existingState.statusJobs[2], existingStatusJob];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        loadingState: 'loading',
      };
      const expectedStatusJobs: OrderStatusJob[] = [
        existingState.statusJobs[0],
        existingState.statusJobs[1],
        existingState.statusJobs[2],
        expectedStatusJob,
      ];

      const action = DataDownloadOrderStatusJobActions.requestOrderStatus({orderId, orderTitle});
      const state = reducer(existingState, action);

      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('setOrderStatusResponse', () => {
    it('updates an existing status job by setting its status to the given value, consecutiveErrorsCount to zero and loadingState to loaded; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        status: undefined,
        consecutiveErrorsCount: 8,
        loadingState: 'error',
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];
      const orderStatus: OrderStatus = {
        orderId: existingStatusJob.id,
        status: {
          type: 'failure',
          message: 'my cabbages!11!!',
        },
        submittedDateString: 'February 21, 2005',
        finishedDateString: 'July 19, 2008',
        internalId: 666,
      };

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        loadingState: 'loaded',
        status: orderStatus,
        consecutiveErrorsCount: 0,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderStatusJobActions.setOrderStatusResponse({orderStatus});
      const state = reducer(existingState, action);

      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('setOrderStatusError', () => {
    const maximumNumberOfConsecutiveStatusJobErrors = 10;

    it('updates an existing order status by setting its consecutiveErrorsCount to plus one and loadingState to error and isAborted to false if the error count is still under the maximum; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        consecutiveErrorsCount: 8,
        loadingState: 'loading',
        isAborted: true,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        consecutiveErrorsCount: 9,
        loadingState: 'error',
        isAborted: false,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderStatusJobActions.setOrderStatusError({
        error: errorMock,
        orderId: existingStatusJob.id,
        maximumNumberOfConsecutiveStatusJobErrors,
      });
      const state = reducer(existingState, action);

      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });

    it('updates an existing order status by setting its consecutiveErrorsCount to plus one and loadingState to error and isAborted to true if the error count is equal or over the maximum; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        consecutiveErrorsCount: 9,
        loadingState: 'loading',
        isAborted: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        consecutiveErrorsCount: 10,
        loadingState: 'error',
        isAborted: true,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderStatusJobActions.setOrderStatusError({
        error: errorMock,
        orderId: existingStatusJob.id,
        maximumNumberOfConsecutiveStatusJobErrors,
      });
      const state = reducer(existingState, action);

      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('completeOrderStatus', () => {
    it('updates an existing order status by setting its isCompleted to true; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        isCompleted: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        isCompleted: true,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderStatusJobActions.completeOrderStatus({orderId: existingStatusJob.id});
      const state = reducer(existingState, action);

      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });

  describe('cancelOrderStatus', () => {
    it('updates an existing order status by setting its isCompleted to true; keeps everything else', () => {
      const existingStatusJob: OrderStatusJob = {
        ...existingState.statusJobs[1],
        isCancelled: false,
      };
      existingState.statusJobs = [existingState.statusJobs[0], existingStatusJob, existingState.statusJobs[2]];

      const expectedStatusJob: OrderStatusJob = {
        ...existingStatusJob,
        isCancelled: true,
      };
      const expectedStatusJobs: OrderStatusJob[] = [existingState.statusJobs[0], expectedStatusJob, existingState.statusJobs[2]];

      const action = DataDownloadOrderStatusJobActions.cancelOrderStatus({orderId: existingStatusJob.id});
      const state = reducer(existingState, action);

      expect(state.statusJobs).toEqual(expectedStatusJobs);
    });
  });
});
