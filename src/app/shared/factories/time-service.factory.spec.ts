import {timeServiceFactory} from './time-service.factory';
import {DayjsService} from '../services/dayjs.service';

describe('TimeServiceFactory', () => {
  it('returns an instance of dayjs service', () => {
    const result = timeServiceFactory();

    expect(result).toBeInstanceOf(DayjsService);
  });
});
