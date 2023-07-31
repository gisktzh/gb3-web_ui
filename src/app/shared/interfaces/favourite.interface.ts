import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {MapConfigState} from '../../state/map/states/map-config.state';

export type FavouriteBaseConfig = Pick<MapConfigState, 'center' | 'scale'> & {basemap: string};

export interface Favourite {
  id: string;
  title: string;
  content: ActiveMapItemConfiguration[];
  baseConfig: FavouriteBaseConfig;
  drawings: any[]; // todo: finalize interface once API is ready
  measurements: any[]; // todo: finalize interface once API is ready
  /**
   * Declares whether a favourite is invalid because e.g. its components do no longer exist.
   */
  invalid?: boolean;
}

export type CreateFavourite = Omit<Favourite, 'invalid' | 'id'>;

export type FavouritesResponse = Favourite[];
