import {Gb3StyledInternalDrawingRepresentation, Gb3StyleRepresentation} from '../interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from './symbolization-to-gb3-converter.utils';
import {Gb3VectorLayer} from '../interfaces/gb3-vector-layer.interface';

describe('SymbolizationToGb3ConverterUtils', () => {
  describe('convertInternalToExternalRepresentation', () => {
    it('maps all features into the geojson features array and returns a Gb3VectorLayer', () => {
      const drawingsMock: Gb3StyledInternalDrawingRepresentation[] = [
        {
          type: 'Feature',
          geometry: {type: 'Point', srs: 2056, coordinates: []},
          source: UserDrawingLayer.Drawings,
          labelText: 'A',
          properties: {__id: 'a', style: {} as Gb3StyleRepresentation, __tool: 'point'},
        },
        {
          type: 'Feature',
          geometry: {type: 'Point', srs: 2056, coordinates: []},
          source: UserDrawingLayer.Drawings,
          labelText: 'B',
          properties: {__id: 'b', style: {} as Gb3StyleRepresentation, __tool: 'point'},
        },
      ];

      const actual = SymbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(drawingsMock);

      expect(actual.geojson.features.length).toEqual(2);
      expect(actual.geojson.features[0].properties.text).toEqual(drawingsMock[0].labelText);
      expect(actual.geojson.features[1].properties.text).toEqual(drawingsMock[1].labelText);
    });
  });

  describe('convertExternalToInternalRepresentation', () => {
    it('correctly maps an external item to the internal representation', () => {
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

      const actual = SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(mockVectorLayer, mockedSource);

      expect(actual[0].labelText).toEqual(mockText);
      expect(actual[0].geometry.type).toEqual('Point');
      expect(actual[0].geometry.srs).toEqual(2056);
      expect(actual[0].source).toEqual(mockedSource);
    });
  });
});
