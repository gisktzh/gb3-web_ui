import {DateToStringPipe} from './date-to-string.pipe';

describe('DateToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new DateToStringPipe();
    expect(pipe).toBeTruthy();
  });

  it('formats a defined date', () => {
    const pipe = new DateToStringPipe();

    const date = new Date(2023, 1, 3); // monthIndex + 1 === month
    const dateFormat = 'YYYY-MM-DD';

    const result = pipe.transform(date, dateFormat);

    const expected = '2023-02-03';
    expect(result).toEqual(expected);
  });

  it('formats an undefined date', () => {
    const pipe = new DateToStringPipe();

    const date = undefined;
    const dateFormat = 'YYYY-MM-DD';

    const result = pipe.transform(date, dateFormat);

    const expected = '';
    expect(result).toEqual(expected);
  });
});
