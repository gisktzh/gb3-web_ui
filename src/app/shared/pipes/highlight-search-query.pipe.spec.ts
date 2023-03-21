import {HighlightSearchQueryPipe} from './highlight-search-query.pipe';

describe('HighlightSearchQueryPipe', () => {
  let pipe: HighlightSearchQueryPipe;
  beforeAll(() => {
    pipe = new HighlightSearchQueryPipe();
  });
  describe('single search queries', () => {
    it('highlights exactly one element if only one match', () => {
      const textItem = 'abcde fghi';
      const searchQuery = 'd';

      const result = pipe.transform(textItem, searchQuery);

      const expected = 'abc<b>d</b>e fghi';
      expect(result).toEqual(expected);
    });

    it('highlights all elements if multiple match', () => {
      const textItem = 'abcde fghi abcde dddd';
      const searchQuery = 'd';

      const result = pipe.transform(textItem, searchQuery);

      const expected = 'abc<b>d</b>e fghi abc<b>d</b>e <b>d</b><b>d</b><b>d</b><b>d</b>';
      expect(result).toEqual(expected);
    });

    it('highlights exact word and word part matches', () => {
      const textItem = 'ab abc abcd';
      const searchQuery = 'abc';

      const result = pipe.transform(textItem, searchQuery);

      const expected = 'ab <b>abc</b> <b>abc</b>d';
      expect(result).toEqual(expected);
    });

    it('highlights nothing if no matches', () => {
      const textItem = 'lorem ipsum dolor sic amet';
      const searchQuery = 'this will not be found';

      const result = pipe.transform(textItem, searchQuery);

      expect(result).toEqual(textItem);
    });

    it('ignores case', () => {
      const textItem = 'A a Aa';
      const searchQuery = 'A';

      const result = pipe.transform(textItem, searchQuery);

      const expected = '<b>A</b> <b>a</b> <b>A</b><b>a</b>';
      expect(result).toEqual(expected);
    });

    it('works with multi word queries', () => {
      const textItem = 'a Text consisting of this findable part, and more';
      const searchQuery = 'a Text consisting of this findable part';

      const result = pipe.transform(textItem, searchQuery);

      const expected = '<b>a Text consisting of this findable part</b>, and more';
      expect(result).toEqual(expected);
    });
  });

  describe('multiple search queries', () => {
    it('highlights matches if only one search query is sent', () => {
      const textItem = 'Lookup1 Lookup2';
      const searchQuery = ['Lookup1'];

      const result = pipe.transform(textItem, searchQuery);

      const expected = '<b>Lookup1</b> Lookup2';
      expect(result).toEqual(expected);
    });

    it('highlights all results for multiple matched queries', () => {
      const textItem = 'DoesNotMatch Lookup1 Lookup2 DoesAlsoNotMatch PartialMatchForLookup1DoesMatch';
      const searchQuery = ['Lookup1', 'Lookup2'];

      const result = pipe.transform(textItem, searchQuery);

      const expected = 'DoesNotMatch <b>Lookup1</b> <b>Lookup2</b> DoesAlsoNotMatch PartialMatchFor<b>Lookup1</b>DoesMatch';
      expect(result).toEqual(expected);
    });

    it('highlights multiple multiword searchqueries', () => {
      const textItem = 'This is findable part1, followed by findable part2, terminated by non-findable part.';
      const searchQuery = ['findable part1', 'followed by findable part2'];

      const result = pipe.transform(textItem, searchQuery);

      const expected = 'This is <b>findable part1</b>, <b>followed by findable part2</b>, terminated by non-findable part.';
      expect(result).toEqual(expected);
    });

    it('highlights nothing if no queries match', () => {
      const textItem = 'This is the textitem';
      const searchQuery = ['cannot be found 1', 'cannot be found 2'];

      const result = pipe.transform(textItem, searchQuery);

      expect(result).toEqual(textItem);
    });
  });
});
