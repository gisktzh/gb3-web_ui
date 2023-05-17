import {DrawingLayer} from '../enums/drawing-layer.enum';

/**
 * RGBA values, where R,G,B = [0..255] and A = [0.0..1.0]; used for coloring elements
 */
export interface SymbolizationColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HasColor {
  color: SymbolizationColor;
}

interface HasWidth {
  width: number;
}

interface PointSymbolization extends HasColor {
  type: 'point';
}

interface LineSymbolization extends HasColor, HasWidth {}

type PolygonFillSymbolization = HasColor;

interface PolygonOutlineSymbolization extends HasColor, HasWidth {}

interface PolygonSymbolization {
  fill: PolygonFillSymbolization;
  outline: PolygonOutlineSymbolization;
}

export interface SymbolizationStyle {
  point: PointSymbolization;
  line: LineSymbolization;
  polygon: PolygonSymbolization;
}

export type LayerSymbolizations = {[key in DrawingLayer]: SymbolizationStyle};
