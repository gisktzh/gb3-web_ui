import {FormatLineBreaksPipe} from './format-line-breaks.pipe';

describe('FormatLineBreaksPipe', () => {
  let pipe: FormatLineBreaksPipe;
  beforeAll(() => {
    pipe = new FormatLineBreaksPipe();
  });

  ['A\r\nB', 'A\rB', 'A\nB'].forEach((textItem) => {
    it(`formats line breaks correctly for ${textItem}`, () => {
      const result = pipe.transform(textItem);
      expect(result).toBe('A<br />B');
    });
  });

  it('does nothing when plain text provided ', () => {
    const textItem = 'Some text';

    const result = pipe.transform(textItem);

    const expected = 'Some text';

    expect(result).toBe(expected);
  });
});
