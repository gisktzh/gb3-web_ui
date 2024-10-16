import {TextOrPlaceholderPipe} from './text-or-placeholder.pipe';

describe('TextOrPlaceholderPipe', () => {
  let pipe: TextOrPlaceholderPipe;

  beforeEach(() => {
    pipe = new TextOrPlaceholderPipe();
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('returns the string value if present', () => {
    const value: string = 'test';

    const result = pipe.transform(value);

    const expected = 'test';
    expect(result).toEqual(expected);
  });
  it('returns the placeholder if the value is null', () => {
    const value = null;

    const result = pipe.transform(value);

    const expected = '-';
    expect(result).toEqual(expected);
  });
});
