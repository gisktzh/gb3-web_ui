import {EsriSymbolToStyleRepresentationUtils} from './esri-symbol-to-style-representation.utils';
import Color from '@arcgis/core/Color';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import {
  Gb3LineStringStyle,
  Gb3PointStyle,
  Gb3PolygonStyle,
  Gb3TextStyle,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import SimpleMarkerSymbolProperties = __esri.SimpleMarkerSymbolProperties;
import SimpleFillSymbolProperties = __esri.SimpleFillSymbolProperties;
import SimpleLineSymbolProperties = __esri.SimpleLineSymbolProperties;
import TextSymbolProperties = __esri.TextSymbolProperties;

describe('EsriSymbolToStyleRepresentationUtils', () => {
  it('returns a Gb3PointStyle for a simple-marker symbol', () => {
    const outlineColor = [255, 123, 15, 0.5]; // #ff7b0f
    const fillColor = [0, 22, 150, 0.8]; // #001696
    const properties: SimpleMarkerSymbolProperties = {
      size: 13,
      color: new Color(fillColor),
      outline: {width: 22, color: new Color(outlineColor)},
    };
    const mockSymbol: SimpleMarkerSymbol = new SimpleMarkerSymbol(properties);

    const actual = EsriSymbolToStyleRepresentationUtils.convert(mockSymbol);
    expect(actual.type).toEqual('point');
    expect((actual as Gb3PointStyle).pointRadius).toEqual(13);
    expect((actual as Gb3PointStyle).fillOpacity).toEqual(0.8);
    expect((actual as Gb3PointStyle).strokeOpacity).toEqual(0.5);
    expect((actual as Gb3PointStyle).strokeWidth).toEqual(22);
    expect((actual as Gb3PointStyle).fillColor).toEqual('#001696');
    expect((actual as Gb3PointStyle).strokeColor).toEqual('#ff7b0f');
  });

  it('returns a Gb3LineStringStyle for a simple-line symbol', () => {
    const lineColor = [0, 22, 150, 0.8]; // #001696
    const properties: SimpleLineSymbolProperties = {
      width: 13,
      color: new Color(lineColor),
    };
    const mockSymbol: SimpleLineSymbol = new SimpleLineSymbol(properties);

    const actual = EsriSymbolToStyleRepresentationUtils.convert(mockSymbol);
    expect(actual.type).toEqual('line');
    expect((actual as Gb3LineStringStyle).strokeWidth).toEqual(13);
    expect((actual as Gb3PointStyle).strokeOpacity).toEqual(0.8);
    expect((actual as Gb3PointStyle).strokeColor).toEqual('#001696');
  });

  it('returns a Gb3PolygonStyle for a simple-fill symbol', () => {
    const outlineColor = [255, 123, 15, 0.5]; // #ff7b0f
    const fillColor = [0, 22, 150, 0.8]; // #001696
    const properties: SimpleFillSymbolProperties = {
      color: new Color(fillColor),
      outline: {width: 22, color: new Color(outlineColor)},
    };
    const mockSymbol: SimpleFillSymbol = new SimpleFillSymbol(properties);

    const actual = EsriSymbolToStyleRepresentationUtils.convert(mockSymbol);
    expect(actual.type).toEqual('polygon');
    expect((actual as Gb3PolygonStyle).fillOpacity).toEqual(0.8);
    expect((actual as Gb3PolygonStyle).strokeOpacity).toEqual(0.5);
    expect((actual as Gb3PolygonStyle).strokeWidth).toEqual(22);
    expect((actual as Gb3PolygonStyle).fillColor).toEqual('#001696');
    expect((actual as Gb3PolygonStyle).strokeColor).toEqual('#ff7b0f');
  });

  it('returns a Gb3TextStyle for a text symbol', () => {
    const outlineColor = [255, 123, 15, 0.5]; // #ff7b0f
    const fillColor = [0, 22, 150, 0.8]; // #001696
    const properties: TextSymbolProperties = {
      color: new Color(fillColor),
      haloColor: new Color(outlineColor),
      haloSize: 22,
      font: {
        size: 13,
        family: 'my-family',
      },
      yoffset: 1337,
    };
    const mockSymbol: TextSymbol = new TextSymbol(properties);

    const actual = EsriSymbolToStyleRepresentationUtils.convert(mockSymbol);
    expect(actual.type).toEqual('text');
    expect((actual as Gb3TextStyle).haloColor).toEqual('#ff7b0f');
    expect((actual as Gb3TextStyle).haloRadius).toEqual('22');
    expect((actual as Gb3TextStyle).fontColor).toEqual('#001696');
    expect((actual as Gb3TextStyle).fontFamily).toEqual('my-family');
    expect((actual as Gb3TextStyle).fontSize).toEqual('13');
    expect((actual as Gb3TextStyle).labelAlign).toEqual('ct');
    expect((actual as Gb3TextStyle).labelYOffset).toEqual('1337');
    expect((actual as Gb3TextStyle).label).toEqual('[text]');
  });
});
