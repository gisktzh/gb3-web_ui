import {Feature} from 'geojson';
import {DrawingLayer} from '../enums/drawing-layer.enum';
import {HasSrs} from './geojson-types-with-srs.interface';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {AbstractEsriDrawableToolStrategy} from '../../map/services/esri-services/tool-service/strategies/abstract-esri-drawable-tool.strategy';
import {MapfishPrintStyleProperties} from '../models/mapfish-print-style-properties-generated.interface';
import {SupportedEsriTool} from '../../map/services/esri-services/tool-service/strategies/supported-esri-tool.type';
import {DrawingSymbolDefinition} from './drawing-symbol/drawing-symbol-definition.interface';
import {MapDrawingSymbol} from './map-drawing-symbol.interface';

interface InternalDrawingRepresentation<T = Record<never, never>> extends Feature<SupportedGeometry, T> {
  labelText?: string;
  mapDrawingSymbol?: MapDrawingSymbol;
  source: DrawingLayer;
  geometry: SupportedGeometry & HasSrs;
}

interface InternalDrawingType {
  type: 'point' | 'line' | 'polygon' | 'text' | 'symbol';
}

/**
 * An internal drawing representation without any properties.
 */
export type UnstyledInternalDrawingRepresentation = InternalDrawingRepresentation;

type LineStyleConfiguration = Pick<MapfishPrintStyleProperties, 'strokeColor' | 'strokeOpacity' | 'strokeWidth'>;

interface AreaStyleConfiguration extends LineStyleConfiguration, Pick<MapfishPrintStyleProperties, 'fillColor' | 'fillOpacity'> {}

interface PointStyleConfiguration extends AreaStyleConfiguration, Pick<MapfishPrintStyleProperties, 'pointRadius'> {}

type TextStyleConfiguration = Pick<
  MapfishPrintStyleProperties,
  'label' | 'fontSize' | 'fontColor' | 'fontFamily' | 'labelYOffset' | 'labelAlign' | 'haloColor' | 'haloRadius'
>;

type DrawingSymbolStyleConfiguration = {
  symbolSize: number;
  symbolRotation: number;
  symbolDefinition: DrawingSymbolDefinition | undefined | null;
};

export interface Gb3LineStringStyle extends InternalDrawingType, LineStyleConfiguration {
  type: 'line';
}

export interface Gb3PointStyle extends InternalDrawingType, PointStyleConfiguration {
  type: 'point';
}

export interface Gb3PolygonStyle extends InternalDrawingType, AreaStyleConfiguration {
  type: 'polygon';
}

export interface Gb3TextStyle extends InternalDrawingType, TextStyleConfiguration {
  type: 'text';
}

export interface Gb3SymbolStyle extends InternalDrawingType, DrawingSymbolStyleConfiguration {
  type: 'symbol';
}

export type Gb3StyleRepresentation = Gb3TextStyle | Gb3PointStyle | Gb3LineStringStyle | Gb3PolygonStyle | Gb3SymbolStyle;

/**
 * An internal drawing representation that has the required properties for usage with the GB3 system.
 */
export type Gb3StyledInternalDrawingRepresentation = InternalDrawingRepresentation<{
  style: Gb3StyleRepresentation;
  [AbstractEsriDrawableToolStrategy.identifierFieldName]: string;
  [AbstractEsriDrawableToolStrategy.belongsToFieldName]?: string;
  [AbstractEsriDrawableToolStrategy.toolFieldName]: SupportedEsriTool;
}>;
