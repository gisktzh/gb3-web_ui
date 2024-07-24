import {PrintDescriptionPipe} from './print-description.pipe';

describe('PrintDescriptionPipe', () => {
  let pipe: PrintDescriptionPipe;

  beforeEach(() => {
    pipe = new PrintDescriptionPipe();
  });
  it('creates an instance', () => {
    const pipe = new PrintDescriptionPipe();
    expect(pipe).toBeTruthy();
  });

  it('transforms the description correctly', () => {
    const completed = true;
    const title = 'Mocktitle';
    const comment = 'Mockcomment';

    const result = pipe.transform(completed, title, comment);

    const expected = `Beschriftung: Kartentitel: ${title}, Kommentar: ${comment}`;
    expect(result).toEqual(expected);
  });
  it('transforms the description correctly when not completed', () => {
    const completed = false;
    const title = 'Mocktitle';
    const comment = 'Mockcomment';

    const result = pipe.transform(completed, title, comment);

    const expected = 'Beschriftung';
    expect(result).toEqual(expected);
  });
  it('transforms the description correctly when title is empty', () => {
    const completed = true;
    const title = '';
    const comment = 'Mockcomment';

    const result = pipe.transform(completed, title, comment);

    const expected = `Beschriftung: Kartentitel: -, Kommentar: ${comment}`;
    expect(result).toEqual(expected);
  });
  it('transforms the description correctly when title is null', () => {
    const completed = true;
    const title = null;
    const comment = 'Mockcomment';

    const result = pipe.transform(completed, title, comment);

    const expected = `Beschriftung: Kartentitel: -, Kommentar: ${comment}`;
    expect(result).toEqual(expected);
  });
});
