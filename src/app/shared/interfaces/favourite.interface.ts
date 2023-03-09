import {ActiveMapItem} from '../../map/models/active-map-item.model';
import {MapLayer} from './topic.interface';

export interface Favourite {
  id: number;
  title: string;
  content: FavouriteLayerConfiguration[];
  /**
   * Declares whether a favourite is invalid because e.g. its components do no longer exist.
   */
  invalid?: boolean;
}

export type CreateFavourite = Pick<Favourite, 'title' | 'content'>;

export type FavouritesResponse = Favourite[];

type FavouriteLayerSubLayerConfiguration = Pick<MapLayer, 'id' | 'layer' | 'visible'>;

export interface FavouriteLayerConfiguration extends Pick<ActiveMapItem, 'visible' | 'opacity' | 'isSingleLayer' | 'mapId'> {
  layers: FavouriteLayerSubLayerConfiguration[];
}
