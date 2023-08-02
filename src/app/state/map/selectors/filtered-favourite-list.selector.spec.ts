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

  it('returns all favourites if filter string is empty', () => {
    const filterString = '';

    const actual = selectFilteredFavouriteList.projector(filterString, basicMockState);

    expect(actual).toEqual(mockFavourites);
  });

  it('returns an empty list if no matches are found', () => {
    const filterString = 'no match shall be found';

    const actual = selectFilteredFavouriteList.projector(filterString, basicMockState);

    expect(actual).toEqual([]);
  });

  it('returns partial matches from the start of the word', () => {
    const filterString = 'fav';

    const actual = selectFilteredFavouriteList.projector(filterString, basicMockState);

    expect(actual).toEqual(mockFavourites);
  });

  it('returns partial matches from within of the word', () => {
    const filterString = 'ouri';

    const actual = selectFilteredFavouriteList.projector(filterString, basicMockState);

    expect(actual).toEqual(mockFavourites);
  });

  it('uses case-insensitive matching', () => {
    const filterString = 'with-capslock';

    const actual = selectFilteredFavouriteList.projector(filterString, basicMockState);

    expect(actual).toEqual([mockFavourites[2]]);
  });

  it('uses case-insensitive filter', () => {
    const filterString = 'FaVoUrItE';

    const actual = selectFilteredFavouriteList.projector(filterString, basicMockState);

    expect(actual).toEqual(mockFavourites);
  });
});
