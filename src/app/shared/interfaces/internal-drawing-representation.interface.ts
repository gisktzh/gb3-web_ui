import {Feature} from 'geojson';
import {DrawingLayer} from '../enums/drawing-layer.enum';
import {HasSrs} from './geojson-types-with-srs.interface';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {FavouriteGb3DrawingStyle} from './favourite.interface';
import {AbstractEsriDrawableToolStrategy} from '../../map/services/esri-services/tool-service/strategies/abstract-esri-drawable-tool.strategy';

export interface InternalDrawingRepresentation
  extends Feature<
    SupportedGeometry,
    {
      style: FavouriteGb3DrawingStyle;
      [AbstractEsriDrawableToolStrategy.identifierFieldName]: string;
    }
  > {
  labelText?: string;
  source: DrawingLayer;
  geometry: SupportedGeometry & HasSrs;
}
