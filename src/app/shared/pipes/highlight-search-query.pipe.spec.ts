import {HighlightSearchQueryPipe} from './highlight-search-query.pipe';

describe('HighlightSearchQueryPipe', () => {
  let pipe: HighlightSearchQueryPipe;
  beforeAll(() => {
    pipe = new HighlightSearchQueryPipe();
  });
  describe('single search queries', () => {
    it.each([
      {textItem: 'abcde fghi', searchQuery: 'd', expected: 'abc<b>d</b>e fghi', matchType: 'only one'},
      {
        textItem: 'abcde fghi abcde dddd',
        searchQuery: 'd',
        expected: 'abc<b>d</b>e fghi abc<b>d</b>e <b>d</b><b>d</b><b>d</b><b>d</b>',
        matchType: 'several',
      },
      {textItem: 'ab abc abcd', searchQuery: 'abc', expected: 'ab <b>abc</b> <b>abc</b>d', matchType: 'partial word'},
      {
        textItem: 'lorem ipsum dolor sic amet',
        searchQuery: 'this will not be found',
        expected: 'lorem ipsum dolor sic amet',
        matchType: 'no',
      },
      {textItem: 'A a Aa', searchQuery: 'A', expected: '<b>A</b> <b>a</b> <b>A</b><b>a</b>', matchType: 'non-matching case'},
      {
        textItem: 'a Text consisting of this findable part, and more',
        searchQuery: 'a Text consisting of this findable part',
        expected: '<b>a Text consisting of this findable part</b>, and more',
        matchType: 'multi-word',
      },
      {textItem: 'abcde 🤔 (fghi)', searchQuery: '🤔 (', expected: 'abcde <b>🤔 (</b>fghi)', matchType: 'special charachters'},
    ])('highlights correctly with $matchType match(es)', ({textItem, searchQuery, expected}) => {
      const result = pipe.transform(textItem, searchQuery);
      expect(result).toEqual(expected);
    });
  });

  describe('multiple search queries', () => {
    it.each([
      {textItem: 'Lookup1 Lookup2', searchQueries: ['Lookup1'], expected: '<b>Lookup1</b> Lookup2', queryType: 'one'},
      {
        textItem: 'DoesNotMatch Lookup1 Lookup2 DoesAlsoNotMatch PartialMatchForLookup1DoesMatch',
        searchQueries: ['Lookup1', 'Lookup2'],
        expected: 'DoesNotMatch <b>Lookup1</b> <b>Lookup2</b> DoesAlsoNotMatch PartialMatchFor<b>Lookup1</b>DoesMatch',
        queryType: 'multiple',
      },
      {
        textItem: 'This is findable part1, followed by findable part2, terminated by non-findable part.',
        searchQueries: ['findable part1', 'followed by findable part2'],
        expected: 'This is <b>findable part1</b>, <b>followed by findable part2</b>, terminated by non-findable part.',
        queryType: 'multiple multiword',
      },
      {
        textItem: 'This is the textitem',
        searchQueries: ['cannot be found 1', 'cannot be found 2'],
        expected: 'This is the textitem',
        queryType: 'multiple non-existent multi-word',
      },
      {
        textItem: 'A a Aa B b Bb C c Cc',
        searchQueries: ['A', 'b'],
        expected: '<b>A</b> <b>a</b> <b>A</b><b>a</b> <b>B</b> <b>b</b> <b>B</b><b>b</b> C c Cc',
        queryType: 'multiple non-matching case',
      },
      {
        textItem: 'AbC . * + ? $ ^ } { ) ( | ] [ \\ Def \0 👌 hIj',
        searchQueries: ['.', '*', '+', '?', '$', '^', '}', '{', ')', '(', '|', ']', '[', '\\', '\0', '👌'],
        expected:
          'AbC <b>.</b> <b>*</b> <b>+</b> <b>?</b> <b>$</b> <b>^</b> <b>}</b> <b>{</b> <b>)</b> <b>(</b> <b>|</b> <b>]</b> <b>[</b> <b>\\</b> Def <b>\0</b> <b>👌</b> hIj',
        queryType: 'several special character',
      },
    ])('highlights matches correctly with $queryType', ({textItem, searchQueries, expected}) => {
      const result = pipe.transform(textItem, searchQueries);
      expect(result).toEqual(expected);
    });
  });
});
