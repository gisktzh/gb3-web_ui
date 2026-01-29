import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {DrawingSymbolDescriptor} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';
import {EsriDrawingSymbolDescriptor} from './../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-descriptor';
import {
  Gb3LineStringStyle,
  Gb3PointStyle,
  Gb3PolygonStyle,
  Gb3SymbolStyle,
  Gb3TextStyle,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {StyleRepresentationToEsriSymbolUtils} from './style-representation-to-esri-symbol.utils';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';
import {EsriMapDrawingSymbol} from '../types/esri-map-drawing-symbol.type';
import {DrawingSymbolDescriptorMatcher} from 'src/app/testing/matchers/drawing-symbol-descriptor.matcher';
import {EsriDrawingSymbolDefinition} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';

class MockDrawingSymbolDesciptor implements DrawingSymbolDescriptor {
  protected setupProps: __esri.CIMSymbolProperties;
  public type: string = 'mock_descr';

  constructor(properties: __esri.CIMSymbolProperties) {
    this.setupProps = properties;
  }

  public toJSON(): string {
    return JSON.stringify(this.setupProps);
  }

  public resize(_: number): void {
    // noop
  }

  public rotate(_: number): void {
    // noop
  }

  public toSVG(): SVGElement | undefined {
    return undefined;
  }
}

class MockDrawingSymbolDefinition implements DrawingSymbolDefinition {
  public type: string = 'mock_def';
  public size: number = 10;
  public rotation: number = 10;
  public name: string;
  protected setupProps: __esri.WebStyleSymbolProperties;
  protected resultingDrawinSymbolDescriptor: MockDrawingSymbolDesciptor;

  constructor(properties: __esri.WebStyleSymbolProperties, resultingDrawinSymbolDescriptor: MockDrawingSymbolDesciptor) {
    this.setupProps = properties;
    this.resultingDrawinSymbolDescriptor = resultingDrawinSymbolDescriptor;
    this.name = properties.name || 'mock';
  }

  public fetchDrawingSymbolDescriptor(_1: number, _2: number): Promise<DrawingSymbolDescriptor> {
    return Promise.resolve(this.resultingDrawinSymbolDescriptor);
  }

  public toJSON(): string {
    return JSON.stringify(this.setupProps);
  }

  public belongsToCollection(_: string): boolean {
    return false;
  }
}

describe('StyleRepresentationToEsriSymbolUtils', () => {
  beforeEach(() => {
    jasmine.addMatchers(DrawingSymbolDescriptorMatcher);
  });

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

  it('should return an EsriDrawingSymbolDescriptor for a Gb3SymbolStyle with a given mapDrawingSymbol with drawingSymbolDescriptor', async () => {
    const mockStyle: Gb3SymbolStyle = {
      type: 'symbol',
      symbolSize: 10,
      symbolRotation: 10,
    };

    const mockEsriDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const mockMapDrawingSymbol: EsriMapDrawingSymbol = {
      drawingSymbolDescriptor: mockEsriDrawingSymbolDescriptor,
    };

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle, undefined, mockMapDrawingSymbol);

    expect(actual).toBeInstanceOf(EsriDrawingSymbolDescriptor);
    expect(actual).toEqualSymbolDescriptor(mockEsriDrawingSymbolDescriptor);
  });

  it('should convert a present non-Esri DrawingSymbolDesciptor to a EsriDrawingSymbolDescriptor  for a Gb3SymbolStyle with a given mapDrawingSymbol with drawingSymbolDescriptor', async () => {
    const mockStyle: Gb3SymbolStyle = {
      type: 'symbol',
      symbolSize: 10,
      symbolRotation: 10,
    };

    const mockDrawingSymbolDescriptor = new MockDrawingSymbolDesciptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const transformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const mockMapDrawingSymbol: MapDrawingSymbol = {
      drawingSymbolDescriptor: mockDrawingSymbolDescriptor,
    };

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle, undefined, mockMapDrawingSymbol);

    expect(actual).toBeInstanceOf(EsriDrawingSymbolDescriptor);
    expect(actual).toEqualSymbolDescriptor(transformedDrawingSymbolDescriptor);
  });

  it('should return an EsriDrawingSymbolDescriptor for a Gb3SymbolStyle with a given mapDrawingSymbol with drawingSymbolDefinition and not touch the symbol definition given from style', async () => {
    const mockEsriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition();

    const mockMapDrawingSymbol: MapDrawingSymbol = {
      drawingSymbolDefinition: mockEsriDrawingSymbolDefinition,
    };

    const transformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const mockStyle: Gb3SymbolStyle = {
      type: 'symbol',
      symbolSize: 10,
      symbolRotation: 11,
      symbolDefinition: mockEsriDrawingSymbolDefinition,
    };

    const fetchSymbolSpy = spyOn(mockEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').and.resolveTo(
      transformedDrawingSymbolDescriptor,
    );

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle, undefined, mockMapDrawingSymbol);

    expect(actual).toBeInstanceOf(EsriDrawingSymbolDescriptor);
    expect(actual).toEqualSymbolDescriptor(transformedDrawingSymbolDescriptor);
    expect(fetchSymbolSpy).toHaveBeenCalledWith(10, 11);
  });

  it('should convert a present non-Esri DrawingSymbolDefinition to a EsriDrawingSymbolDescriptor  for a Gb3SymbolStyle with a given mapDrawingSymbol with drawingSymbolDescriptor and not touch the symbol definition given from style', async () => {
    const mockDrawingSymbolDescriptor = new MockDrawingSymbolDesciptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const mockDrawingSymbolDefinition = new MockDrawingSymbolDefinition(
      {
        name: 'some-symbol',
      },
      mockDrawingSymbolDescriptor,
    );

    const mockStyle: Gb3SymbolStyle = {
      type: 'symbol',
      symbolSize: 10,
      symbolRotation: 11,
      symbolDefinition: mockDrawingSymbolDefinition,
    };

    const mockMapDrawingSymbol: MapDrawingSymbol = {
      drawingSymbolDefinition: mockDrawingSymbolDefinition,
    };

    const transformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const mockEsriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition();

    const fromJsonSpy = spyOn(EsriDrawingSymbolDefinition, 'fromJSON').and.returnValue(mockEsriDrawingSymbolDefinition);
    const fetchSymbolSpy = spyOn(mockEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').and.resolveTo(
      transformedDrawingSymbolDescriptor,
    );

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle, undefined, mockMapDrawingSymbol);

    expect(actual).toBeInstanceOf(EsriDrawingSymbolDescriptor);
    expect(actual).toEqualSymbolDescriptor(transformedDrawingSymbolDescriptor);
    expect(fromJsonSpy).toHaveBeenCalledWith(mockDrawingSymbolDefinition.toJSON());
    expect(fetchSymbolSpy).toHaveBeenCalledWith(10, 11);
  });

  it('should return an ESRI DrawingSymbolDescriptor from a JSON representation of an ESRI drawing symbol definition in the style', async () => {
    const mockEsriDrawingSymbolDefinition = new EsriDrawingSymbolDefinition();

    const mockMapDrawingSymbol: MapDrawingSymbol = {};

    const transformedDrawingSymbolDescriptor = new EsriDrawingSymbolDescriptor({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPointSymbol',
          scaleX: 12,
        },
      },
    });

    const mockStyle: Gb3SymbolStyle = {
      type: 'symbol',
      symbolSize: 10,
      symbolRotation: 11,
      symbolDefinition: mockEsriDrawingSymbolDefinition,
    };

    const fromJsonSpy = spyOn(EsriDrawingSymbolDefinition, 'fromJSON').and.returnValue(mockEsriDrawingSymbolDefinition);
    const fetchSymbolSpy = spyOn(mockEsriDrawingSymbolDefinition, 'fetchDrawingSymbolDescriptor').and.resolveTo(
      transformedDrawingSymbolDescriptor,
    );

    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle, undefined, mockMapDrawingSymbol);

    expect(actual).toBeInstanceOf(EsriDrawingSymbolDescriptor);
    expect(actual).toEqualSymbolDescriptor(transformedDrawingSymbolDescriptor);
    expect(fromJsonSpy).toHaveBeenCalledWith(mockEsriDrawingSymbolDefinition.toJSON());
    expect(fetchSymbolSpy).toHaveBeenCalledWith(10, 11);
  });

  it('should return an empty EsriDrawingSymbolDescriptor if nothing was given', async () => {
    const mockStyle: Gb3SymbolStyle = {
      type: 'symbol',
      symbolSize: 10,
      symbolRotation: 11,
    };

    const expected = new EsriDrawingSymbolDescriptor();
    const actual = await StyleRepresentationToEsriSymbolUtils.convert(mockStyle, undefined, undefined);

    expect(actual).toEqualSymbolDescriptor(expected);
  });
});
