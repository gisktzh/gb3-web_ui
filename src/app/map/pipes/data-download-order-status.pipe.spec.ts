import {DataDownloadOrderStatusPipe} from './data-download-order-status.pipe';
import {OrderStatus, OrderStatusJob, orderStatusKeys} from '../../shared/interfaces/geoshop-order-status.interface';

describe('DataDownloadOrderStatusPipe', () => {
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

  it('formats aborted status jobs correctly', () => {
    const pipe = new DataDownloadOrderStatusPipe();

    const abortedStatusJob: OrderStatusJob = {
      ...orderStatusJob,
      isAborted: true,
    };

    const result = pipe.transform(abortedStatusJob);

    const expected = DataDownloadOrderStatusPipe.ABORTED_STATUS_JOB_TEXT;
    expect(result).toBe(expected);
  });

  it('formats cancelled status jobs correctly', () => {
    const pipe = new DataDownloadOrderStatusPipe();

    const abortedStatusJob: OrderStatusJob = {
      ...orderStatusJob,
      isCancelled: true,
    };

    const result = pipe.transform(abortedStatusJob);

    const expected = DataDownloadOrderStatusPipe.CANCELLED_STATUS_JOB_TEXT;
    expect(result).toBe(expected);
  });

  it('formats status jobs without status correctly', () => {
    const pipe = new DataDownloadOrderStatusPipe();

    const abortedStatusJob: OrderStatusJob = {
      ...orderStatusJob,
      status: undefined,
    };

    const result = pipe.transform(abortedStatusJob);

    const expected = DataDownloadOrderStatusPipe.NEW_STATUS_JOB_TEXT;
    expect(result).toBe(expected);
  });

  it('formats status jobs depending on the status correctly', () => {
    const pipe = new DataDownloadOrderStatusPipe();

    orderStatusKeys.forEach((orderStatusKey) => {
      const message = 'test message';
      const abortedStatusJob: OrderStatusJob = {
        ...orderStatusJob,
        status: {
          ...orderStatus,
          status: {
            type: orderStatusKey,
            message,
          },
        },
      };

      const result = pipe.transform(abortedStatusJob);

      let expected: string;
      switch (orderStatusKey) {
        case 'submitted':
          expected = DataDownloadOrderStatusPipe.STATUS_JOB_SUBMITTED_TEXT;
          break;
        case 'queued':
          expected = DataDownloadOrderStatusPipe.STATUS_JOB_QUEUED_TEXT;
          break;
        case 'working':
          expected = DataDownloadOrderStatusPipe.STATUS_JOB_WORKING_TEXT;
          break;
        case 'success':
          expected = DataDownloadOrderStatusPipe.STATUS_JOB_SUCCESS_TEXT;
          break;
        case 'failure':
          expected = `Fehler: '${message}'`;
          break;
        case 'unknown':
          expected = DataDownloadOrderStatusPipe.STATUS_JOB_UNKNOWN_TEXT;
          break;
      }
      expect(result).toBe(expected);
    });
  });

  it('formats failed status jobs without message correctly', () => {
    const pipe = new DataDownloadOrderStatusPipe();

    const failedStatusJob: OrderStatusJob = {
      ...orderStatusJob,
      status: {
        ...orderStatus,
        status: {
          type: 'failure',
        },
      },
    };

    const result = pipe.transform(failedStatusJob);

    const expected = DataDownloadOrderStatusPipe.STATUS_JOB_FAILURE_DEFAULT_TEXT;
    expect(result).toBe(expected);
  });
});
