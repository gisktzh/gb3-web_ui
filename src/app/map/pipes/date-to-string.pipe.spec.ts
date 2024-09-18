import {DateToStringPipe} from './date-to-string.pipe';
import {TestBed} from '@angular/core/testing';

describe('DateToStringPipe', () => {
  let pipe: DateToStringPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = new DateToStringPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats a defined date', () => {
    const date = new Date(2023, 1, 3); // monthIndex + 1 === month
    const dateFormat = 'YYYY-MM-DD';

    const result = pipe.transform(date, dateFormat);

    const expected = '2023-02-03';
    expect(result).toEqual(expected);
  });

  it('formats an undefined date', () => {
    const date = undefined;
    const dateFormat = 'YYYY-MM-DD';

    const result = pipe.transform(date, dateFormat);

    const expected = '';
    expect(result).toEqual(expected);
  });
});
