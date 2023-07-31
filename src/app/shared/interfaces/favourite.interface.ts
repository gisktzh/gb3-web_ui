import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';

export interface Favourite {
  id: string;
  title: string;
  content: ActiveMapItemConfiguration[];
  east: number;
  north: number;
  scaledenom: number;
  basemap: string;
  drawings: any[]; // todo: finalize interface once API is ready
  measurements: any[]; // todo: finalize interface once API is ready
  /**
   * Declares whether a favourite is invalid because e.g. its components do no longer exist.
   */
  invalid?: boolean;
}

export type CreateFavourite = Omit<Favourite, 'invalid' | 'id'>;

export type FavouritesResponse = Favourite[];
