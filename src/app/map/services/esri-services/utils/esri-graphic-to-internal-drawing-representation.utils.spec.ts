import Graphic from '@arcgis/core/Graphic';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {InternalDrawingLayer, UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {EsriSymbolizationService} from '../esri-symbolization.service';
import Color from '@arcgis/core/Color';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import {MapConstants} from '../../../../shared/constants/map.constants';
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {EsriGraphicToInternalDrawingRepresentationUtils} from './esri-graphic-to-internal-drawing-representation.utils';
import {UnsupportedGeometryType} from '../errors/esri.errors';
import Polyline from '@arcgis/core/geometry/Polyline';
import SimpleFillSymbolProperties = __esri.SimpleFillSymbolProperties;

describe('EsriGraphicToInternalDrawingRepresentationUtils', () => {
  let esriSymbolizationService: EsriSymbolizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore({})],
    });
    esriSymbolizationService = TestBed.inject(EsriSymbolizationService);
  });

  it('converts an esri graphic to the GB3 internal drawing representation', () => {
    const fillColorHex = '#abcdef';
    const strokeColorHex = '#080085';
    const strokeWidth = 42;
    const properties: SimpleFillSymbolProperties = {
      color: new Color(Color.fromHex(fillColorHex)),
      outline: {width: strokeWidth, color: new Color(strokeColorHex)},
    };
    const id = 'testid';
    const labelText = 'labeltext';
    const mockSymbol: SimpleFillSymbol = new SimpleFillSymbol(properties);
    const graphic: Graphic = new Graphic({
      attributes: {
        [MapConstants.DRAWING_IDENTIFIER]: id,
      },
      geometry: new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [12, 0],
            [0, 12],
          ],
        ],
      }),
      symbol: mockSymbol,
    });

    const actual = EsriGraphicToInternalDrawingRepresentationUtils.convert(
      graphic,
      labelText,
      2056,
      InternalDrawingLayer.Selection,
      esriSymbolizationService,
    );
    const expected: Gb3StyledInternalDrawingRepresentation = {
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
    };

    expect(actual).toEqual(expected);
  });

  it('throws an error if the geometry type is not supported', () => {
    const graphic = new Graphic({
      geometry: new Polyline(),
    });
    expect(() =>
      EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphic,
        undefined,
        2056,
        UserDrawingLayer.Drawings,
        esriSymbolizationService,
      ),
    ).toThrow(new UnsupportedGeometryType('MultiLineString'));
  });
});
