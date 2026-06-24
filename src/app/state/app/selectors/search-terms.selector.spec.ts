import {selectTerms} from './search-terms.selector';

describe('selectTerms', () => {
  it('splits a given string into a list of terms', () => {
    const searchString = 'lorem ipsum dolor   sit amet'; // Explicitly add a few spaces
    const expectedList = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];

    expect(selectTerms.projector(searchString)).toEqual(expectedList);
  });
});
