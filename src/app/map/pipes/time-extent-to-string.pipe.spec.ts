import {TimeExtentToStringPipe} from './time-extent-to-string.pipe';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TestBed} from '@angular/core/testing';
import {TIME_SERVICE} from '../../app.module';
import {DayjsTimeService} from '../../shared/services/dayjs-time.service';
import {TimeService} from '../interfaces/time.service';

describe('TimeExtentToStringPipe', () => {
  let pipe: TimeExtentToStringPipe;
  let timeService: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [{provide: TIME_SERVICE, useClass: DayjsTimeService}]});
    timeService = TestBed.inject(TIME_SERVICE);
    pipe = new TimeExtentToStringPipe(timeService);
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats a defined time extent', () => {
    const timeExtent: TimeExtent = {
      start: new Date(2023, 1, 3),
      end: new Date(2024, 2, 4),
    };
    const dateFormat = 'YYYY-MM-DD';
    const hasSimpleCurrentValue = false;

    const result = pipe.transform(timeExtent, dateFormat, hasSimpleCurrentValue);

    const expected = '2023-02-03 - 2024-03-04';
    expect(result).toEqual(expected);
  });

  it('formats a defined time extent using simple values', () => {
    const timeExtent: TimeExtent = {
      start: new Date(2023, 1, 3),
      end: new Date(2024, 2, 4),
    };
    const dateFormat = 'YYYY-MM-DD';
    const hasSimpleCurrentValue = true;

    const result = pipe.transform(timeExtent, dateFormat, hasSimpleCurrentValue);

    const expected = '2023-02-03';
    expect(result).toEqual(expected);
  });

  it('formats an undefined time extent', () => {
    const timeExtent = undefined;
    const dateFormat = 'YYYY-MM-DD';
    const hasSimpleCurrentValue = true;

    const result = pipe.transform(timeExtent, dateFormat, hasSimpleCurrentValue);

    const expected = '';
    expect(result).toEqual(expected);
  });
});
