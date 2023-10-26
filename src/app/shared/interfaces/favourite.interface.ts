import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {MapConfigState} from '../../state/map/states/map-config.state';
import {UserDrawingVectorLayers} from './user-drawing-vector-layers.interface';

export type FavouriteBaseConfig = Pick<MapConfigState, 'center' | 'scale'> & {basemap: string};

interface FavouriteDrawingType {
  type: 'point' | 'line' | 'polygon';
}

export interface FavouriteGb3LineStringStyle extends FavouriteDrawingType {
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
  type: 'line';
}

export interface FavouriteGb3PointStyle extends FavouriteDrawingType {
  fillColor: string;
  fillOpacity: number;
  pointRadius: string;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  type: 'point';
}

export interface FavouriteGb3PolygonStyle extends FavouriteDrawingType {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  type: 'polygon';
}

export type FavouriteGb3DrawingStyle = FavouriteGb3PointStyle | FavouriteGb3LineStringStyle | FavouriteGb3PolygonStyle;

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
