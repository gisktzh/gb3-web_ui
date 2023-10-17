import {Gb3StyledInternalDrawingRepresentation} from '../interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {FavouriteGb3DrawingStyle} from '../interfaces/favourite.interface';
import {SymbolizationToGb3ConverterUtils} from './symbolization-to-gb3-converter.utils';

describe('SymbolizationToGb3ConverterUtils', () => {
  it('maps all features into the geojson features array and returns a Gb3VectorLayer', () => {
    const drawingsMock: Gb3StyledInternalDrawingRepresentation[] = [
      {
        type: 'Feature',
        geometry: {type: 'Point', srs: 2056, coordinates: []},
        source: UserDrawingLayer.Drawings,
        labelText: 'A',
        properties: {__id: 'a', style: {} as FavouriteGb3DrawingStyle},
      },
      {
        type: 'Feature',
        geometry: {type: 'Point', srs: 2056, coordinates: []},
        source: UserDrawingLayer.Drawings,
        labelText: 'B',
        properties: {__id: 'b', style: {} as FavouriteGb3DrawingStyle},
      },
    ];

    const actual = SymbolizationToGb3ConverterUtils.convert(drawingsMock);

    expect(actual.geojson.features.length).toEqual(2);
    expect(actual.geojson.features[0].properties.text).toEqual(drawingsMock[0].labelText);
    expect(actual.geojson.features[1].properties.text).toEqual(drawingsMock[1].labelText);
  });
});
