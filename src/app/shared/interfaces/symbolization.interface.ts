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

export interface HexColor {
  hexColor: string;
  alpha: number;
}

interface HasColor {
  color: SymbolizationColor;
}

interface HasWidth {
  width: number;
}

interface AbstractPointSymbolization {
  type: 'picture' | 'simple' | 'text';
}

export interface SimplePointSymbolization extends AbstractPointSymbolization, HasColor {
  type: 'simple';
  outline: HasWidth & HasColor;
  size: number;
}

export interface TextSymbolization extends HasColor {
  outline: HasColor & HasWidth;
  size: number;
  /** Horizontal offset - by default, the anchorpoint is in the center of the point */
  xOffset: number;
  /** Vertical offset - by default, the anchorpoint is in the center of the point */
  yOffset: number;
}

export interface PicturePointSymbolization extends AbstractPointSymbolization {
  type: 'picture';
  /** Image URL string */
  url: string;
  /** Width of the icon */
  width: number;
  /** Height of the icon */
  height: number;
  /** Horizontal offset - by default, the anchorpoint is in the center of the path */
  xOffset: number;
  /** Vertical offset - by default, the anchorpoint is in the center of the path */
  yOffset: number;
  /** Rotation of the icon, [-180.0..180.0] */
  angle: number;
}

type PointSymbolization = SimplePointSymbolization | PicturePointSymbolization;

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
  text: TextSymbolization;
}

/**
 * DefaultSymbolization only defines a default for the SimplePointSymbolization, as it cannot know which type of Picture is the default.
 */
export interface DefaultSymbolization extends SymbolizationStyle {
  point: SimplePointSymbolization;
}

/**
 * Represents a collection of symbolizations for all DrawingLayers that exist. By using the enum as key, it enforces that each
 * DrawingLayer has a symbolization associated with it or else the compiler raises an error.
 */
export type LayerSymbolizations = {[key in DrawingLayer]: SymbolizationStyle};
