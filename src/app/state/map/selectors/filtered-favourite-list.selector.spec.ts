import {selectFilteredFavouriteList} from './filtered-favourite-list.selector';
import {Favourite} from '../../../shared/interfaces/favourite.interface';

const mockFavourites: Favourite[] = [
  {title: 'favourite-1'} as Favourite,
  {title: 'favourite-2'} as Favourite,
  {title: 'favourite-3-WITH-CapsLock'} as Favourite,
];

describe('selectFilteredFavouriteList', () => {
  let basicMockState: Favourite[];

  beforeEach(() => {
    basicMockState = mockFavourites;
  });

  it.each([
    {filter: '', expected: mockFavourites},
    {filter: 'no match shall be found', expected: []},
    {filter: 'fav', expected: mockFavourites},
    {filter: 'ouri', expected: mockFavourites},
    {filter: 'with-capslock', expected: [mockFavourites[2]]},
    {filter: 'FaVoUrItE', expected: mockFavourites},
  ])('returns the correct collection of favorites for filterstring "%filter"', ({filter, expected}) => {
    const actual = selectFilteredFavouriteList.projector(filter, basicMockState);
    expect(actual).toEqual(expected);
  });
});
