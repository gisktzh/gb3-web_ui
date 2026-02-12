import {Gb3StyledInternalDrawingRepresentation, Gb3StyleRepresentation} from '../interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from './symbolization-to-gb3-converter.utils';
import {Gb3VectorLayer} from '../interfaces/gb3-vector-layer.interface';
import {MapConstants} from '../constants/map.constants';
import {TestBed} from '@angular/core/testing';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolServiceStub} from 'src/app/testing/map-testing/drawing-symbol-service.stub';
import {EsriDrawingSymbolDefinition} from 'src/app/map/services/esri-services/tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';
import {EsriDrawingSymbolDescriptor} from 'src/app/map/services/esri-services/tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-descriptor';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {HasSrs} from '../interfaces/geojson-types-with-srs.interface';

describe('SymbolizationToGb3ConverterUtils', () => {
  let utils: SymbolizationToGb3ConverterUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [{provide: DRAWING_SYMBOLS_SERVICE, useClass: DrawingSymbolServiceStub}],
    });

    utils = TestBed.inject(SymbolizationToGb3ConverterUtils);
  });

  describe('convertInternalToExternalRepresentation', () => {
    it('maps all features into the geojson features array and returns a Gb3VectorLayer', async () => {
      const drawingsMock: Gb3StyledInternalDrawingRepresentation[] = [
        {
          type: 'Feature',
          geometry: {type: 'Point', srs: 2056, coordinates: [], bbox: [0, 1, 2, 3, 4, 5]} as SupportedGeometry & HasSrs,
          source: UserDrawingLayer.Drawings,
          labelText: 'A',
          properties: {
            [MapConstants.DRAWING_IDENTIFIER]: 'a',
            style: {} as Gb3StyleRepresentation,
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
        },
        {
          type: 'Feature',
          geometry: {type: 'Point', srs: 2056, coordinates: []},
          source: UserDrawingLayer.Drawings,
          labelText: 'B',
          properties: {
            [MapConstants.DRAWING_IDENTIFIER]: 'b',
            style: {} as Gb3StyleRepresentation,
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
        },
      ];

      const actual = utils.convertInternalToExternalRepresentation(drawingsMock, 1, 1);

      expect(actual.geojson.features.length).toEqual(2);
      expect(actual.geojson.features[0].properties.text).toEqual(drawingsMock[0].labelText);
      expect(actual.geojson.features[1].properties.text).toEqual(drawingsMock[1].labelText);
      expect(actual.geojson.features[0].geometry.bbox).toEqual([0, 1, 2, 3, 4, 5]);
      expect(actual.geojson.features[1].geometry.bbox).toBeUndefined();
    });

    it('converts a given symbol and siozes it correctly when not rotated', () => {
      const mockSymbolSize = 100;
      const mockSymbolRotation = 0;
      const mockSymbolDescriptor = new EsriDrawingSymbolDescriptor();
      const mockSVGString = 'someSVG';

      const drawingsMock: Gb3StyledInternalDrawingRepresentation[] = [
        {
          type: 'Feature',
          geometry: {type: 'Point', srs: 2056, coordinates: []},
          source: UserDrawingLayer.Drawings,
          labelText: 'A',
          properties: {
            [MapConstants.DRAWING_IDENTIFIER]: 'a',
            style: {
              type: 'symbol',
              symbolSize: mockSymbolSize,
              symbolRotation: mockSymbolRotation,
            },
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
          mapDrawingSymbol: {
            drawingSymbolDescriptor: mockSymbolDescriptor,
          },
        },
      ];

      const mapDrawingSymbolFromJSONSpy = spyOn(DrawingSymbolServiceStub.prototype, 'getSVGString').and.returnValue(mockSVGString);

      const actual = utils.convertInternalToExternalRepresentation(drawingsMock, 1, 1);

      const actualStyle = actual.styles[actual.geojson.features[0].properties.style];

      expect(actualStyle.externalGraphic).toEqual(mockSVGString);
      // This value has been pre-calculated.
      expect(actualStyle.pointRadius).toBe(48.75);
      expect(mapDrawingSymbolFromJSONSpy).toHaveBeenCalledWith(mockSymbolDescriptor, 48.75);
    });

    it('should calculate the size of the icon correctly when rotating', () => {
      const mockSymbolSize = 100;
      const mockSymbolRotation = 45; // Yields maximum size difference.
      const mockSymbolDescriptor = new EsriDrawingSymbolDescriptor();
      const mockSVGString = 'someSVG';

      const drawingsMock: Gb3StyledInternalDrawingRepresentation[] = [
        {
          type: 'Feature',
          geometry: {type: 'Point', srs: 2056, coordinates: []},
          source: UserDrawingLayer.Drawings,
          labelText: 'A',
          properties: {
            [MapConstants.DRAWING_IDENTIFIER]: 'a',
            style: {
              type: 'symbol',
              symbolSize: mockSymbolSize,
              symbolRotation: mockSymbolRotation,
            },
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
          mapDrawingSymbol: {
            drawingSymbolDescriptor: mockSymbolDescriptor,
          },
        },
      ];

      const mapDrawingSymbolFromJSONSpy = spyOn(DrawingSymbolServiceStub.prototype, 'getSVGString').and.returnValue(mockSVGString);

      const actual = utils.convertInternalToExternalRepresentation(drawingsMock, 1, 1);

      const actualStyle = actual.styles[actual.geojson.features[0].properties.style];

      expect(actualStyle.externalGraphic).toEqual(mockSVGString);
      // This value has been pre-calculated.
      expect(actualStyle.pointRadius).toBe(170.7267179276847);
      expect(mapDrawingSymbolFromJSONSpy).toHaveBeenCalledWith(mockSymbolDescriptor, 170.7267179276847);
    });
  });

  describe('convertExternalToInternalRepresentation', () => {
    it('correctly maps an external item to the internal representation', async () => {
      const mockText = 'Gurkenbröters';
      const mockVectorLayer: Gb3VectorLayer = {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [0, 1337],
              },
              properties: {
                style: 'a',
                text: mockText,
                id: 'xyz',
                tool: 'point',
              },
            },
          ],
        },
        styles: {
          a: {
            property: 'a',
          },
          b: {
            property: 'b',
          },
        },
      };
      const mockedSource: UserDrawingLayer = UserDrawingLayer.Drawings;

      const actual = await utils.convertExternalToInternalRepresentation(mockVectorLayer, mockedSource);

      expect(actual[0].labelText).toEqual(mockText);
      expect(actual[0].geometry.type).toEqual('Point');
      expect(actual[0].geometry.srs).toEqual(2056);
      expect(actual[0].source).toEqual(mockedSource);
    });

    it('correctly converts JSON to a map drawing symbol', async () => {
      const mockDrawingSymbolDefinition = 'SomeJson';
      const mockVectorLayer: Gb3VectorLayer = {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [0, 1337],
              },
              properties: {
                style: 'a',
                id: 'xyz',
                tool: 'point',
              },
            },
          ],
        },
        styles: {
          a: {
            property: 'a',
            type: 'symbol',
            drawingSymbolDefinition: mockDrawingSymbolDefinition,
          },
          b: {
            property: 'b',
          },
        },
      };
      const mockedSource: UserDrawingLayer = UserDrawingLayer.Drawings;

      const mockMapDrawingSymbol = {
        drawingSymbolDefinition: new EsriDrawingSymbolDefinition(),
        drawingSymbolDescripton: new EsriDrawingSymbolDescriptor(),
      };

      const mapDrawingSymbolFromJSONSpy = spyOn(DrawingSymbolServiceStub.prototype, 'mapDrawingSymbolFromJSON').and.resolveTo(
        mockMapDrawingSymbol,
      );

      const actual = await utils.convertExternalToInternalRepresentation(mockVectorLayer, mockedSource);

      expect(actual[0].geometry.type).toEqual('Point');
      expect(actual[0].geometry.srs).toEqual(2056);
      expect(actual[0].source).toEqual(mockedSource);
      expect(actual[0].mapDrawingSymbol).toEqual(mockMapDrawingSymbol);

      expect(mapDrawingSymbolFromJSONSpy).toHaveBeenCalledWith(mockDrawingSymbolDefinition);
    });
  });
});
