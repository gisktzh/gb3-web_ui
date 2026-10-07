import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {UserDrawingVectorLayers} from './user-drawing-vector-layers.interface';
import {Coordinate} from './coordinate.interface';

export type FavouriteBaseConfig = {
  basemap: string;
  center?: Coordinate;
  scale?: number;
};

export interface Favourite extends UserDrawingVectorLayers {
  id: string;
  title: string;
  content: ActiveMapItemConfiguration[];
  baseConfig: FavouriteBaseConfig;
  /**
   * Declares whether a favourite is invalid because e.g. its components do no longer exist.
   */
  invalid?: boolean;
}

export type CreateFavourite = Omit<Favourite, 'invalid' | 'id'>;

export type FavouritesResponse = Favourite[];
