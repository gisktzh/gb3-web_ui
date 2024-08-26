import {FormatContentPipe} from './format-content.pipe';

describe('FormatContentPipe', () => {
  let pipe: FormatContentPipe;
  beforeAll(() => {
    pipe = new FormatContentPipe();
  });

  ['https', 'http'].forEach((protocol) => {
    it(`wraps a link correctly using an accessible label with protocol ${protocol}`, () => {
      const textItem = `Lorem ipsum ${protocol}://www.example.com Test 123`;

      const result = pipe.transform(textItem);

      const expected = `Lorem ipsum <a href="${protocol}://www.example.com" target="_blank">www.example.com</a> Test 123`;
      expect(result).toEqual(expected);
    });
  });

  it(`removes trailing slashes`, () => {
    const textItem = `Lorem ipsum https://www.example.com/subfolder/ Test 123`;

    const result = pipe.transform(textItem);

    const expected = `Lorem ipsum <a href="https://www.example.com/subfolder/" target="_blank">www.example.com/subfolder</a> Test 123`;
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
