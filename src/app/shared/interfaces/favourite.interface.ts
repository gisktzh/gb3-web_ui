import {MapLayer} from './topic.interface';
import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';

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

export interface FavouriteLayerConfiguration extends Pick<Gb2WmsActiveMapItem, 'visible' | 'opacity' | 'isSingleLayer'> {
  layers: FavouriteLayerSubLayerConfiguration[];
  mapId: string; // todo: nested type not pickable
}
