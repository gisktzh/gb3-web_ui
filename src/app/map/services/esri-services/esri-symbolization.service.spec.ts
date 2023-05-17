import {TestBed} from '@angular/core/testing';

import {EsriSymbolizationService} from './esri-symbolization.service';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {SupportedSrs} from '../../../shared/types/supported-srs';
import {DrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {GeometryCollectionWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

const SRS: SupportedSrs = 2056;
const minimalTestSet = [
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalLineString(SRS),
    type: 'LineString'
  },
  {
    expected: 'SimpleLineSymbol',
    expectedInstanceOf: SimpleLineSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiLineString(SRS),
    type: 'MultiLineString'
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPoint(SRS),
    type: 'Point'
  },
  {
    expected: 'SimpleMarkerSymbol',
    expectedInstanceOf: SimpleMarkerSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPoint(SRS),
    type: 'MultiPoint'
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalPolygon(SRS),
    type: 'Polygon'
  },
  {
    expected: 'SimpleFillSymbol',
    expectedInstanceOf: SimpleFillSymbol,
    geometry: MinimalGeometriesUtils.getMinimalMultiPolygon(SRS),
    type: 'MultiPolygon'
  }
];
describe('EsriSymbolizationService', () => {
  let service: EsriSymbolizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriSymbolizationService);
  });

  describe('geometry-dependent symbolization', () => {
    minimalTestSet.forEach(({expected, expectedInstanceOf, geometry, type}) => {
      it(`returns ${expected} for ${type}`, () => {
        const minimalLineString = MinimalGeometriesUtils.getMinimalLineString(SRS);

        const result = service.createSymbolizationForDrawingLayer(geometry, DrawingLayer.FEATURE_HIGHLIGHT);

        expect(result).toBeInstanceOf(expectedInstanceOf);
      });
    });

    it('throws for GeometryCollection', () => {
      const collection: GeometryCollectionWithSrs = {type: 'GeometryCollection', geometries: [], srs: SRS};

      expect(() => service.createSymbolizationForDrawingLayer(collection, DrawingLayer.FEATURE_HIGHLIGHT)).toThrow();
    });
  });
});
