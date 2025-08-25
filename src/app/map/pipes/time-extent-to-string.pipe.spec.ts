import {TimeExtentToStringPipe} from './time-extent-to-string.pipe';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TestBed} from '@angular/core/testing';
import {TIME_SERVICE} from '../../app.tokens';
import {timeServiceFactory} from '../../shared/factories/time-service.factory';

describe('TimeExtentToStringPipe', () => {
  let pipe: TimeExtentToStringPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeExtentToStringPipe, {provide: TIME_SERVICE, useValue: timeServiceFactory()}],
    });

    pipe = TestBed.inject(TimeExtentToStringPipe);
  });
  it('creates an instance', () => {
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
