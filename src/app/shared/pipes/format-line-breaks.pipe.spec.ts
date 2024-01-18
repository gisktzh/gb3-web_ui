import {FormatLineBreaksPipe} from './format-line-breaks.pipe';

describe('FormatLineBreaksPipe', () => {
  let pipe: FormatLineBreaksPipe;
  beforeAll(() => {
    pipe = new FormatLineBreaksPipe();
  });
  it('formats line breaks correctly', () => {
    const textItem =
      'SSF3, SSF2, SSF1, SOF3, SOF2, SOF1, Hof2, Hof1, DP, D3, D2, D1 \r\nErklärungen dazu siehe unter Attribut Beschreibung_D (=deutsch) und Beschreibung_E (=englisch)';

    const result = pipe.transform(textItem);

    const expected =
      'SSF3, SSF2, SSF1, SOF3, SOF2, SOF1, Hof2, Hof1, DP, D3, D2, D1 <br>Erklärungen dazu siehe unter Attribut Beschreibung_D (=deutsch) und Beschreibung_E (=englisch)';

    expect(result).toBe(expected);
  });
  it('does not format when line breaks do not match', () => {
    const textItem =
      'SSF3, SSF2, SSF1, SOF3, SOF2, SOF1, Hof2, Hof1, DP, D3, D2, D1 \nErklärungen dazu siehe unter Attribut Beschreibung_D (=deutsch) und Beschreibung_E (=englisch)';

    const result = pipe.transform(textItem);

    const expected =
      'SSF3, SSF2, SSF1, SOF3, SOF2, SOF1, Hof2, Hof1, DP, D3, D2, D1 \nErklärungen dazu siehe unter Attribut Beschreibung_D (=deutsch) und Beschreibung_E (=englisch)';

    expect(result).toBe(expected);
  });
  it('does nothing when plain text provided ', () => {
    const textItem = 'Some text';

    const result = pipe.transform(textItem);

    const expected = 'Some text';

    expect(result).toBe(expected);
  });
});
