import {Feature} from 'geojson';
import {DrawingLayer} from '../enums/drawing-layer.enum';
import {HasSrs} from './geojson-types-with-srs.interface';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {AbstractEsriDrawableToolStrategy} from '../../map/services/esri-services/tool-service/strategies/abstract-esri-drawable-tool.strategy';
import {MapfishPrintStyleProperties} from '../models/mapfish-print-style-properties-generated.interface';

interface InternalDrawingRepresentation<T = Record<never, never>> extends Feature<SupportedGeometry, T> {
  labelText?: string;
  source: DrawingLayer;
  geometry: SupportedGeometry & HasSrs;
}

/**
 * An internal drawing representation without any properties.
 */
export type UnstyledInternalDrawingRepresentation = InternalDrawingRepresentation;

export interface InternalDrawingType {
  type: 'point' | 'line' | 'polygon' | 'text';
}

export interface LineStyleConfiguration extends Pick<MapfishPrintStyleProperties, 'strokeColor' | 'strokeOpacity' | 'strokeWidth'> {}

interface AreaStyleConfiguration extends LineStyleConfiguration, Pick<MapfishPrintStyleProperties, 'fillColor' | 'fillOpacity'> {}

interface PointStyleConfiguration extends Pick<MapfishPrintStyleProperties, 'pointRadius'> {}

interface TextStyleConfiguration
  extends Pick<
    MapfishPrintStyleProperties,
    'label' | 'fontSize' | 'fontColor' | 'fontFamily' | 'labelYOffset' | 'labelAlign' | 'haloColor' | 'haloRadius'
  > {}

export interface Gb3LineStringStyle extends InternalDrawingType, LineStyleConfiguration {
  type: 'line';
}

export interface Gb3PointStyle extends InternalDrawingType, AreaStyleConfiguration, PointStyleConfiguration {
  type: 'point';
}

export interface Gb3PolygonStyle extends InternalDrawingType, AreaStyleConfiguration {
  type: 'polygon';
}

export interface Gb3TextStyle extends InternalDrawingType, TextStyleConfiguration {
  type: 'text';
}

export type Gb3StyleRepresentation = Gb3TextStyle | Gb3PointStyle | Gb3LineStringStyle | Gb3PolygonStyle;

/**
 * An internal drawing representation that has the required properties for usage with the GB3 system.
 */
export type Gb3StyledInternalDrawingRepresentation = InternalDrawingRepresentation<{
  style: Gb3StyleRepresentation;
  [AbstractEsriDrawableToolStrategy.identifierFieldName]: string;
  [AbstractEsriDrawableToolStrategy.belongsToFieldName]?: string;
  [AbstractEsriDrawableToolStrategy.toolFieldName]: string;
}>;
