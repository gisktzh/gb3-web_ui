import {
  Gb3LineStringStyle,
  Gb3PointStyle,
  Gb3PolygonStyle,
  Gb3TextStyle,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {StyleRepresentationToEsriSymbolUtils} from './style-representation-to-esri-symbol.utils';

describe('StyleRepresentationToEsriSymbolUtils', () => {
  it('returns a TextSymbol for a Gb3TextStyle', async () => {
    const mockStyle: Gb3TextStyle = {
      fontSize: '12',
      fontFamily: 'blabla',
      labelYOffset: '22',
      type: 'text',
      haloRadius: '23',
      haloColor: '#ff7b0f',
      labelAlign: 'ct',
      fontColor: '#001696',
      label: 'xy',
    };
    const mockLabelText = 'L&P is the best drink';

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle, mockLabelText);

    expect(actual).toBeInstanceOf(TextSymbol);
    expect((actual as TextSymbol).text).toEqual(mockLabelText);
    expect((actual as TextSymbol).font.size).toEqual(12);
    expect((actual as TextSymbol).haloSize).toEqual(23);
    expect((actual as TextSymbol).yoffset).toEqual(22);
    expect((actual as TextSymbol).haloColor?.toHex()).toEqual('#ff7b0f');
    expect((actual as TextSymbol).color?.toHex()).toEqual('#001696');
  });

  it('returns a SimpleMarkerSymbol for a Gb3PointStyle', async () => {
    const mockStyle: Gb3PointStyle = {
      type: 'point',
      strokeColor: '#ff7b0f',
      strokeWidth: 12,
      strokeOpacity: 0.2,
      fillColor: '#001696',
      fillOpacity: 0.3,
      pointRadius: 12,
    };

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle);

    expect(actual).toBeInstanceOf(SimpleMarkerSymbol);
    expect((actual as SimpleMarkerSymbol).color.toHex()).toEqual('#001696');
    expect((actual as SimpleMarkerSymbol).color.a).toEqual(0.3);
    expect((actual as SimpleMarkerSymbol).size).toEqual(12);
    expect((actual as SimpleMarkerSymbol).outline?.color?.toHex()).toEqual('#ff7b0f');
  });

  it('returns a SimpleLineSymbol for a Gb3LineStringStyle', async () => {
    const mockStyle: Gb3LineStringStyle = {
      type: 'line',
      strokeColor: '#ff7b0f',
      strokeWidth: 12,
      strokeOpacity: 0.2,
    };

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle);

    expect(actual).toBeInstanceOf(SimpleLineSymbol);
    expect((actual as SimpleLineSymbol).color?.toHex()).toEqual('#ff7b0f');
    expect((actual as SimpleLineSymbol).color?.a).toEqual(0.2);
    expect((actual as SimpleLineSymbol).width).toEqual(12);
  });

  it('returns a SimpleFillSymbol for a Gb3PolygonStyle', async () => {
    const mockStyle: Gb3PolygonStyle = {
      type: 'polygon',
      strokeColor: '#ff7b0f',
      strokeWidth: 12,
      strokeOpacity: 0.2,
      fillColor: '#001696',
      fillOpacity: 0.3,
    };

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle);

    expect(actual).toBeInstanceOf(SimpleFillSymbol);
    expect((actual as SimpleFillSymbol).color.toHex()).toEqual('#001696');
    expect((actual as SimpleFillSymbol).color.a).toEqual(0.3);
    expect((actual as SimpleFillSymbol).outline?.color?.toHex()).toEqual('#ff7b0f');
  });
});
