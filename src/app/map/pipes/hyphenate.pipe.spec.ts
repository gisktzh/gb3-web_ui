import {HyphenatePipe} from './hyphenate.pipe';
import {hyphenateSync} from 'hyphen/de';

describe('HyphenatePipe', () => {
  const pipe = new HyphenatePipe();

  it('uses the hyphen library in German behind the scenes', () => {
    const value = 'The quick brown fox jumps over the lazy dog.';
    pipe.transform(value);

    expect(hyphenateSync).toHaveBeenCalledWith(value);
  });
});
