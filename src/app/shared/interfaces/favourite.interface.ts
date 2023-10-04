import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {MapConfigState} from '../../state/map/states/map-config.state';
import {Feature, LineString, Point, Polygon} from 'geojson';

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

type FavouriteStyleProperty<T extends FavouriteGb3DrawingStyle> = {style: T};
type FavouritePointFeature = Feature<Point, FavouriteStyleProperty<FavouriteGb3PointStyle>>;
type FavouritePolygonFeature = Feature<Polygon, FavouriteStyleProperty<FavouriteGb3PolygonStyle>>;
type FavouriteLineStringFeature = Feature<LineString, FavouriteStyleProperty<FavouriteGb3LineStringStyle>>;

type FavouriteDrawingFeature = FavouritePointFeature | FavouritePolygonFeature | FavouriteLineStringFeature;

export interface Favourite {
  id: string;
  title: string;
  content: ActiveMapItemConfiguration[];
  baseConfig: FavouriteBaseConfig;
  drawings: FavouriteDrawingFeature[]; // todo: finalize interface once API is ready
  measurements: any[]; // todo: finalize interface once API is ready
  /**
   * Declares whether a favourite is invalid because e.g. its components do no longer exist.
   */
  invalid?: boolean;
}

export type CreateFavourite = Omit<Favourite, 'invalid' | 'id'>;

export type FavouritesResponse = Favourite[];
