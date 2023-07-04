import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';

export interface Favourite {
  id: number;
  title: string;
  content: ActiveMapItemConfiguration[];
  /**
   * Declares whether a favourite is invalid because e.g. its components do no longer exist.
   */
  invalid?: boolean;
}

export type CreateFavourite = Pick<Favourite, 'title' | 'content'>;

export type FavouritesResponse = Favourite[];
