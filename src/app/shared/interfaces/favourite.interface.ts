import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {MapConfigState} from '../../state/map/states/map-config.state';
import {UserDrawingVectorLayers} from './user-drawing-vector-layers.interface';

export type FavouriteBaseConfig = Pick<MapConfigState, 'center' | 'scale'> & {basemap: string};

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
