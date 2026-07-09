import {HyphenateUnderscoresPipe} from './hyphenate-underscores.pipe';

describe('HyphenateUnderscore', () => {
  const pipe = new HyphenateUnderscoresPipe();

  it('should insert a soft hyphen after underscores between word characters', () => {
    expect(pipe.transform('foo_bar')).toBe('foo_\u00ADbar');
    expect(pipe.transform('hello_world_test')).toBe('hello_\u00ADworld_\u00ADtest');
  });

  it('should not modify leading or trailing underscores', () => {
    expect(pipe.transform('_foo')).toBe('_foo');
    expect(pipe.transform('foo_')).toBe('foo_');
    expect(pipe.transform('_foo_')).toBe('_foo_');
  });

  it('should preserve consecutive underscores correctly', () => {
    expect(pipe.transform('__init__')).toBe('__\u00ADinit_\u00AD_');
  });

  it('should leave strings without matching underscores unchanged', () => {
    expect(pipe.transform('foobar')).toBe('foobar');
    expect(pipe.transform('foo-bar')).toBe('foo-bar');
    expect(pipe.transform('')).toBe('');
  });

  it('should only hyphenate underscores surrounded by word characters', () => {
    expect(pipe.transform('foo _ bar')).toBe('foo _ bar');
    expect(pipe.transform('foo_ bar')).toBe('foo_ bar');
    expect(pipe.transform('foo _bar')).toBe('foo _bar');
  });
});
