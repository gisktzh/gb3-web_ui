import {EsriMapDrawingSymbol} from './../types/esri-map-drawing-symbol.type';
import Graphic from '@arcgis/core/Graphic';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {InternalDrawingLayer, UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import Color from '@arcgis/core/Color';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import {MapConstants} from '../../../../shared/constants/map.constants';
import {EsriGraphicToInternalDrawingRepresentationUtils} from './esri-graphic-to-internal-drawing-representation.utils';
import {GeometryMissing, SymbolizationMissing, UnsupportedGeometryType} from '../errors/esri.errors';
import Polyline from '@arcgis/core/geometry/Polyline';
import LineSymbol from '@arcgis/core/symbols/LineSymbol';
import SimpleFillSymbolProperties = __esri.SimpleFillSymbolProperties;
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';

const fillColorHex = '#abcdef';
const strokeColorHex = '#080085';
const strokeWidth = 42;
const properties: SimpleFillSymbolProperties = {
  color: new Color(Color.fromHex(fillColorHex)!),
  outline: {width: strokeWidth, color: new Color(strokeColorHex)},
};
const id = 'testid';
const mockSymbol: SimpleFillSymbol = new SimpleFillSymbol(properties);

function getExpected(
  labelText: undefined | string,
  mapDrawingSymbol: MapDrawingSymbol | undefined,
): Gb3StyledInternalDrawingRepresentation {
  return {
    type: 'Feature',
    source: InternalDrawingLayer.Selection,
    properties: {
      style: {
        fillColor: fillColorHex,
        fillOpacity: 1,
        strokeWidth: strokeWidth,
        strokeOpacity: 1,
        strokeColor: strokeColorHex,
        type: 'polygon',
      },
      [MapConstants.DRAWING_IDENTIFIER]: id,
      [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
      [MapConstants.TOOL_IDENTIFIER]: 'polygon',
    },
    geometry: {
      type: 'Polygon',
      srs: 2056,
      coordinates: [
        [
          [0, 0],
          [12, 0],
          [0, 12],
          [0, 0],
        ],
      ],
    },
    labelText: labelText,
    mapDrawingSymbol: mapDrawingSymbol,
  };
}

function getGraphic(withGeometry: boolean, symbol: SimpleFillSymbol | undefined): Graphic {
  return new Graphic({
    attributes: {
      [MapConstants.DRAWING_IDENTIFIER]: id,
      [MapConstants.TOOL_IDENTIFIER]: 'polygon',
    },
    geometry: withGeometry
      ? new Polygon({
          spatialReference: {wkid: 2056},
          rings: [
            [
              [0, 0],
              [12, 0],
              [0, 12],
            ],
          ],
        })
      : null,
    symbol: symbol,
  });
}

describe('EsriGraphicToInternalDrawingRepresentationUtils', () => {
  it('converts a general esri graphic to the GB3 internal drawing representation', () => {
    const graphic: Graphic = getGraphic(true, mockSymbol);

    const actual = EsriGraphicToInternalDrawingRepresentationUtils.convert(graphic, 2056, InternalDrawingLayer.Selection);
    const expected = getExpected(undefined, undefined);

    expect(actual).toEqual(expected);
  });

  it('converts a esri text graphic to the GB3 internal drawing representation', () => {
    const graphic: Graphic = getGraphic(true, mockSymbol);

    const actual = EsriGraphicToInternalDrawingRepresentationUtils.convertLabelText(
      graphic,
      'hello, world',
      2056,
      InternalDrawingLayer.Selection,
    );
    const expected = getExpected('hello, world', undefined);

    expect(actual).toEqual(expected);
  });

  it('converts a esri map drawing symbol graphic to the GB3 internal drawing representation', () => {
    const graphic: Graphic = getGraphic(true, mockSymbol);

    const symbol: EsriMapDrawingSymbol = {};

    const actual = EsriGraphicToInternalDrawingRepresentationUtils.convertMapDrawingSymbol(
      graphic,
      symbol,
      20,
      20,
      2056,
      InternalDrawingLayer.Selection,
    );
    const expected = getExpected(undefined, symbol);

    expect(actual).toEqual(expected);
  });

  it('throws an appropriate exception if no geometry is given when trying to convert a generalized graphic', () => {
    const graphic: Graphic = getGraphic(false, mockSymbol);

    expect(() => EsriGraphicToInternalDrawingRepresentationUtils.convert(graphic, 2056, InternalDrawingLayer.Selection)).toThrow(
      new GeometryMissing(),
    );
  });

  it('throws an appropriate exception if no symbol is given when trying to convert a generalized graphic', () => {
    const graphic: Graphic = getGraphic(true, undefined);

    expect(() => EsriGraphicToInternalDrawingRepresentationUtils.convert(graphic, 2056, InternalDrawingLayer.Selection)).toThrow(
      new SymbolizationMissing(),
    );
  });

  it('throws an appropriate exception if no geometry is given when trying to convert a text graphic', () => {
    const graphic: Graphic = getGraphic(false, mockSymbol);

    expect(() =>
      EsriGraphicToInternalDrawingRepresentationUtils.convertLabelText(graphic, 'asdf', 2056, InternalDrawingLayer.Selection),
    ).toThrow(new GeometryMissing());
  });

  it('throws an appropriate exception if no symbol is given when trying to convert a text graphic', () => {
    const graphic: Graphic = getGraphic(true, undefined);

    expect(() =>
      EsriGraphicToInternalDrawingRepresentationUtils.convertLabelText(graphic, 'asdf', 2056, InternalDrawingLayer.Selection),
    ).toThrow(new SymbolizationMissing());
  });

  it('throws an appropriate exception if no geometry is given when trying to convert a symbol graphic', () => {
    const graphic: Graphic = getGraphic(false, mockSymbol);
    const symbol: EsriMapDrawingSymbol = {};

    expect(() =>
      EsriGraphicToInternalDrawingRepresentationUtils.convertMapDrawingSymbol(
        graphic,
        symbol,
        20,
        20,
        2056,
        InternalDrawingLayer.Selection,
      ),
    ).toThrow(new GeometryMissing());
  });

  it('throws an appropriate exception if no symbol is given when trying to convert a symbol graphic', () => {
    const graphic: Graphic = getGraphic(true, undefined);
    const symbol: EsriMapDrawingSymbol = {};

    expect(() =>
      EsriGraphicToInternalDrawingRepresentationUtils.convertMapDrawingSymbol(
        graphic,
        symbol,
        20,
        20,
        2056,
        InternalDrawingLayer.Selection,
      ),
    ).toThrow(new SymbolizationMissing());
  });

  it('throws an error if the geometry type is not supported', () => {
    const graphic = new Graphic({
      geometry: new Polyline(),
      symbol: new LineSymbol(),
    });
    expect(() => EsriGraphicToInternalDrawingRepresentationUtils.convert(graphic, 2056, UserDrawingLayer.Drawings)).toThrow(
      new UnsupportedGeometryType('MultiLineString'),
    );
  });
});
