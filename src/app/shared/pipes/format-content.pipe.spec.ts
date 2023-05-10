import {FormatContentPipe} from './format-content.pipe';

describe('FormatContentPipe', () => {
  let pipe: FormatContentPipe;
  beforeAll(() => {
    pipe = new FormatContentPipe();
  });

  it('wraps a link correctly', () => {
    const textItem = 'Lorem ipsum https://www.example.com Test 123';

    const result = pipe.transform(textItem);

    const expected = 'Lorem ipsum <a href="https://www.example.com" target="_blank">https://www.example.com</a> Test 123';
    expect(result).toEqual(expected);
  });

  it('does not wrap URL without protocol', () => {
    const textItem = 'Lorem ipsum www.example.com Test 123';

    const result = pipe.transform(textItem);

    const expected = 'Lorem ipsum www.example.com Test 123';
    expect(result).toEqual(expected);
  });

  it('does not wrap incomplete URL', () => {
    const textItem = 'Lorem ipsum https://incomplete Test 123';

    const result = pipe.transform(textItem);

    const expected = 'Lorem ipsum https://incomplete Test 123';
    expect(result).toEqual(expected);
  });
});
