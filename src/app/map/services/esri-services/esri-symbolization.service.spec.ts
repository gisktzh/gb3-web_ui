import {TestBed} from '@angular/core/testing';

import {EsriSymbolizationService} from './esri-symbolization.service';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {SupportedSrs} from '../../../shared/types/supported-srs.type';
import {InternalDrawingLayer, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {GeometryCollectionWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {
  LayerSymbolizations,
  LineSymbolization,
  PicturePointSymbolization,
  PolygonSymbolization,
  SimplePointSymbolization,
} from '../../../shared/interfaces/symbolization.interface';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {provideMockStore} from '@ngrx/store/testing';
import Color from '@arcgis/core/Color';
import {
  Gb3LineStringStyle,
  Gb3PointStyle,
  Gb3PolygonStyle,
  Gb3TextStyle,
} from '../../../shared/interfaces/internal-drawing-representation.interface';
import SimpleMarkerSymbolProperties = __esri.SimpleMarkerSymbolProperties;
import SimpleLineSymbolProperties = __esri.SimpleLineSymbolProperties;
import SimpleFillSymbolProperties = __esri.SimpleFillSymbolProperties;
import TextSymbolProperties = __esri.TextSymbolProperties;

const SRS: SupportedSrs = 2056;
const mockIconUrl = '/path/to/icon.svg';
const minimalTestSet = [
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalLineString(SRS),
    type: 'LineString',
  },
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiLineString(SRS),
    type: 'MultiLineString',
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPoint(SRS),
    type: 'Point',
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPoint(SRS),
    type: 'MultiPoint',
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPolygon(SRS),
    type: 'Polygon',
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPolygon(SRS),
    type: 'MultiPolygon',
  },
];

// we only mock some of the values; because we mainly need to test different colors and point types.
const mockSymbolizations: LayerSymbolizations = {
  [UserDrawingLayer.Drawings]: {
    text: {
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
      outline: {
        width: 1232,
        color: {
          r: 22,
          g: 12,
          b: 99,
          a: 0.11,
        },
      },
      xOffset: 5,
      yOffset: 1,
      size: 9001,
    },
  },
  [InternalDrawingLayer.LocatePosition]: {
    point: {
      type: 'picture',
      width: 24,
      height: 45,
      url: mockIconUrl,
      yOffset: 12, // half of the image size to set needle at the actual point location
      xOffset: 0,
      angle: 0,
    },
  },
  [InternalDrawingLayer.FeatureHighlight]: {
    point: {
      type: 'simple',
      size: 12,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
      outline: {
        width: 1232,
        color: {
          r: 22,
          g: 12,
          b: 99,
          a: 0.11,
        },
      },
    },
    line: {
      width: 5,
      color: {
        r: 255,
        g: 169,
        b: 0,
        a: 0.6,
      },
    },
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.6,
        },
      },
      outline: {
        width: 5,
        color: {
          r: 164,
          g: 255,
          b: 0,
          a: 1.0,
        },
      },
    },
  },
} as LayerSymbolizations;

describe('EsriSymbolizationService', () => {
  let service: EsriSymbolizationService;

  beforeEach(() => {
    // simple mock by overriding a readonly property and then injecting it into the TestBed.
    let configService = new ConfigService(document);
    configService = Object.assign(configService, {layerSymbolizations: mockSymbolizations});
    TestBed.configureTestingModule({
      providers: [EsriSymbolizationService, {provide: ConfigService, useValue: configService}, provideMockStore()],
    });
    service = TestBed.get(EsriSymbolizationService);
  });

  describe('geometry-dependent symbolization', () => {
    minimalTestSet.forEach(({expected, expectedInstanceOf, geometry, type}) => {
      it(`returns ${expected} for ${type}`, () => {
        const result = service.createSymbolizationForDrawingLayer(geometry, InternalDrawingLayer.FeatureHighlight);

        expect(result).toBeInstanceOf(expectedInstanceOf);
      });
    });

    it('throws for GeometryCollection', () => {
      const collection: GeometryCollectionWithSrs = {type: 'GeometryCollection', geometries: [], srs: SRS};

      expect(() => service.createSymbolizationForDrawingLayer(collection, InternalDrawingLayer.FeatureHighlight)).toThrow();
    });
  });

  describe('point symbol types', () => {
    it('returns a text symbol for features which are a Drawing and have a label, setting the supplied text', () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = UserDrawingLayer.Drawings;
      const label = 'Legolas & Elrond';

      const result = service.createSymbolizationForDrawingLayer(point, testLayer, 'Legolas & Elrond') as TextSymbol;

      const expected = mockSymbolizations[testLayer].text;
      expect(result.text).toEqual(label);
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
      expect(result.haloSize).toEqual(expected.outline.width);
    });

    it("returns a simple point symbol for type 'simple'", () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = InternalDrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleMarkerSymbol;

      const expected = mockSymbolizations[testLayer].point as SimplePointSymbolization;
      expect(result.style).toEqual('circle');
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
      expect(result.outline.color.toRgba()).toEqual([
        expected.outline.color.r,
        expected.outline.color.g,
        expected.outline.color.b,
        expected.outline.color.a,
      ]);
      expect(result.outline.width).toEqual(expected.outline.width);
    });

    it("returns a picture point symbol for type 'picture'", () => {
      const point = MinimalGeometriesUtils.getMinimalPoint(SRS);
      const testLayer = InternalDrawingLayer.LocatePosition;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as PictureMarkerSymbol;

      const expected = mockSymbolizations[testLayer].point as PicturePointSymbolization;
      expect(result.url).toEqual(mockIconUrl);
      expect(result.url).toEqual(expected.url);
      expect(result.width).toEqual(expected.width);
      expect(result.height).toEqual(expected.height);
      expect(result.yoffset).toEqual(expected.yOffset);
      expect(result.xoffset).toEqual(expected.xOffset);
      expect(result.angle).toEqual(expected.angle);
    });
  });

  describe('line symbol type', () => {
    it('returns a line symbol', () => {
      const point = MinimalGeometriesUtils.getMinimalLineString(SRS);
      const testLayer = InternalDrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleLineSymbol;

      const expected = mockSymbolizations[testLayer].line as LineSymbolization;
      expect(result.style).toEqual('solid');
      expect(result.width).toEqual(expected.width);
      expect(result.color.toRgba()).toEqual([expected.color.r, expected.color.g, expected.color.b, expected.color.a]);
    });
  });

  describe('polygon symbol type', () => {
    it('returns a polygon symbol', () => {
      const point = MinimalGeometriesUtils.getMinimalPolygon(SRS);
      const testLayer = InternalDrawingLayer.FeatureHighlight;

      const result = service.createSymbolizationForDrawingLayer(point, testLayer) as SimpleFillSymbol;

      const expected = mockSymbolizations[testLayer].polygon as PolygonSymbolization;
      expect(result.style).toEqual('solid');
      expect(result.color.toRgba()).toEqual([expected.fill.color.r, expected.fill.color.g, expected.fill.color.b, expected.fill.color.a]);
      expect(result.outline.color.toRgba()).toEqual([
        expected.outline.color.r,
        expected.outline.color.g,
        expected.outline.color.b,
        expected.outline.color.a,
      ]);
      expect(result.outline.width).toEqual(expected.outline.width);
    });
  });

  describe('extractGb3SymbolizationFromSymbol', () => {
    it('returns a Gb3PointStyle for a simple-marker symbol', () => {
      const outlineColor = [255, 123, 15, 0.5]; // #ff7b0f
      const fillColor = [0, 22, 150, 0.8]; // #001696
      const properties: SimpleMarkerSymbolProperties = {
        size: 13,
        color: new Color(fillColor),
        outline: {width: 22, color: new Color(outlineColor)},
      };
      const mockSymbol: SimpleMarkerSymbol = new SimpleMarkerSymbol(properties);

      const actual = service.extractGb3SymbolizationFromSymbol(mockSymbol);
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

      const actual = service.extractGb3SymbolizationFromSymbol(mockSymbol);
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

      const actual = service.extractGb3SymbolizationFromSymbol(mockSymbol);
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

      const actual = service.extractGb3SymbolizationFromSymbol(mockSymbol);
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

  describe('extractSymbolFromGb3Representation', () => {
    it('returns a TextSymbol for a Gb3TextStyle', () => {
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

      const actual = service.extractSymbolFromGb3Representation(mockStyle, mockLabelText);

      expect(actual).toBeInstanceOf(TextSymbol);
      expect((actual as TextSymbol).text).toEqual(mockLabelText);
      expect((actual as TextSymbol).font.size).toEqual(12);
      expect((actual as TextSymbol).haloSize).toEqual(23);
      expect((actual as TextSymbol).yoffset).toEqual(22);
      expect((actual as TextSymbol).haloColor.toHex()).toEqual('#ff7b0f');
      expect((actual as TextSymbol).color.toHex()).toEqual('#001696');
    });

    it('returns a SimpleMarkerSymbol for a Gb3PointStyle', () => {
      const mockStyle: Gb3PointStyle = {
        type: 'point',
        strokeColor: '#ff7b0f',
        strokeWidth: 12,
        strokeOpacity: 0.2,
        fillColor: '#001696',
        fillOpacity: 0.3,
        pointRadius: 12,
      };

      const actual = service.extractSymbolFromGb3Representation(mockStyle);

      expect(actual).toBeInstanceOf(SimpleMarkerSymbol);
      expect((actual as SimpleMarkerSymbol).color.toHex()).toEqual('#001696');
      expect((actual as SimpleMarkerSymbol).color.a).toEqual(0.3);
      expect((actual as SimpleMarkerSymbol).size).toEqual(12);
      expect((actual as SimpleMarkerSymbol).outline.color.toHex()).toEqual('#ff7b0f');
    });

    it('returns a SimpleLineSymbol for a Gb3LineStringStyle', () => {
      const mockStyle: Gb3LineStringStyle = {
        type: 'line',
        strokeColor: '#ff7b0f',
        strokeWidth: 12,
        strokeOpacity: 0.2,
      };

      const actual = service.extractSymbolFromGb3Representation(mockStyle);

      expect(actual).toBeInstanceOf(SimpleLineSymbol);
      expect((actual as SimpleLineSymbol).color.toHex()).toEqual('#ff7b0f');
      expect((actual as SimpleLineSymbol).color.a).toEqual(0.2);
      expect((actual as SimpleLineSymbol).width).toEqual(12);
    });

    it('returns a SimpleFillSymbol for a Gb3PolygonStyle', () => {
      const mockStyle: Gb3PolygonStyle = {
        type: 'polygon',
        strokeColor: '#ff7b0f',
        strokeWidth: 12,
        strokeOpacity: 0.2,
        fillColor: '#001696',
        fillOpacity: 0.3,
      };

      const actual = service.extractSymbolFromGb3Representation(mockStyle);

      expect(actual).toBeInstanceOf(SimpleFillSymbol);
      expect((actual as SimpleFillSymbol).color.toHex()).toEqual('#001696');
      expect((actual as SimpleFillSymbol).color.a).toEqual(0.3);
      expect((actual as SimpleFillSymbol).outline.color.toHex()).toEqual('#ff7b0f');
    });
  });
});
