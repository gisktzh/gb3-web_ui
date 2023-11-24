import {selectDataDownloadIncompleteOrderStatusJobs} from './data-download-incomplete-order-status-jobs.selector';
import {OrderStatusJob} from '../../../shared/interfaces/geoshop-order-status.interface';

describe('selectDataDownloadIncompleteOrderStatusJobs', () => {
  it('returns only order status jobs that are not completed', () => {
    const selectStatusJobsMock: OrderStatusJob[] = [
      {
        id: '1',
        title: 'fire nation',
        loadingState: 'loaded',
        consecutiveErrorsCount: 0,
        isCompleted: false,
        isAborted: true,
        isCancelled: false,
      },
      {
        id: '2',
        title: 'balance',
        loadingState: 'loading',
        consecutiveErrorsCount: 0,
        isCompleted: true,
        isAborted: false,
        isCancelled: false,
      },
      {
        id: '3',
        title: 'sokka',
        loadingState: 'error',
        consecutiveErrorsCount: 0,
        isCompleted: false,
        isAborted: false,
        isCancelled: true,
      },
      {
        id: '4',
        title: 'appa',
        loadingState: 'error',
        consecutiveErrorsCount: 999,
        isCompleted: true,
        isAborted: true,
        isCancelled: true,
      },
    ];

    const actual = selectDataDownloadIncompleteOrderStatusJobs.projector(selectStatusJobsMock);
    const expected: OrderStatusJob[] = [selectStatusJobsMock[0], selectStatusJobsMock[2]];

    expect(actual).toEqual(expected);
  });
});
