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

interface AbstractPointSymbolization extends HasColor {
  /** A 'simple' point is rendered as a circle with color as fill; 'svg' is rendered as an SVG path icon */
  type: 'svg' | 'simple';
  size: number;
}

export interface SimplePointSymbolization extends AbstractPointSymbolization {
  type: 'simple';
  outline: HasWidth & HasColor;
}

export interface SvgPointSymbolization extends AbstractPointSymbolization {
  type: 'svg';
  /** SVG path string */
  path: string;
  /** Horizontal offset - by default, the anchorpoint is in the center of the path */
  xOffset: number;
  /** Vertical offset - by default, the anchorpoint is in the center of the path */
  yOffset: number;
  /** Rotation of the icon, [-180.0..180.0] */
  angle: number;
}

type PointSymbolization = SimplePointSymbolization | SvgPointSymbolization;

export interface LineSymbolization extends HasColor, HasWidth {}

type PolygonFillSymbolization = HasColor;

interface PolygonOutlineSymbolization extends HasColor, HasWidth {}

export interface PolygonSymbolization {
  fill: PolygonFillSymbolization;
  outline: PolygonOutlineSymbolization;
}

export interface SymbolizationStyle {
  point: PointSymbolization;
  line: LineSymbolization;
  polygon: PolygonSymbolization;
}

/**
 * Represents a collection of symbolizations for all DrawingLayers that exist. By using the enum as key, it enforces that each
 * DrawingLayer has a symbolization associated with it or else the compiler raises an error.
 */
export type LayerSymbolizations = {[key in DrawingLayer]: SymbolizationStyle};
