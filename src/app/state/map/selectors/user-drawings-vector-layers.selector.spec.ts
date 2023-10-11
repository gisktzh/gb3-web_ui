import {selectUserDrawingsVectorLayers} from './user-drawings-vector-layers.selector';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
import {InternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

describe('selectUserDrawingsVectorLayers', () => {
  it('calls SymbolizationToGb3ConverterUtils.convert for both layer types with its content', () => {
    const drawingsMock: InternalDrawingRepresentation[] = [
      {id: 'a', source: UserDrawingLayer.Drawings} as InternalDrawingRepresentation,
      {id: 'b', source: UserDrawingLayer.Measurements} as InternalDrawingRepresentation,
    ];
    const visibleLayersMock: UserDrawingLayer[] = [UserDrawingLayer.Measurements, UserDrawingLayer.Drawings];
    const utilsMock = spyOn(SymbolizationToGb3ConverterUtils, 'convert');

    selectUserDrawingsVectorLayers.projector(drawingsMock, visibleLayersMock);

    expect(utilsMock).toHaveBeenCalledTimes(2);
    expect(utilsMock).toHaveBeenCalledWith([drawingsMock[0]]);
    expect(utilsMock).toHaveBeenCalledWith([drawingsMock[1]]);
  });

  it('correctly assigns drawings to their layer', () => {
    const drawingsMock: InternalDrawingRepresentation[] = [
      {id: 'a', labelText: 'a', source: UserDrawingLayer.Drawings} as InternalDrawingRepresentation,
      {id: 'b', labelText: 'b', source: UserDrawingLayer.Measurements} as InternalDrawingRepresentation,
    ];
    const visibleLayersMock: UserDrawingLayer[] = [UserDrawingLayer.Measurements, UserDrawingLayer.Drawings];

    const actual = selectUserDrawingsVectorLayers.projector(drawingsMock, visibleLayersMock);

    expect(actual.drawings.geojson.features[0].properties.text).toEqual(drawingsMock[0].labelText);
    expect(actual.measurements.geojson.features[0].properties.text).toEqual(drawingsMock[1].labelText);
  });

  it("does not add invisible layers' features", () => {
    const drawingsMock: InternalDrawingRepresentation[] = [
      {id: 'a', labelText: 'a', source: UserDrawingLayer.Drawings} as InternalDrawingRepresentation,
      {id: 'b', labelText: 'b', source: UserDrawingLayer.Measurements} as InternalDrawingRepresentation,
    ];
    const visibleLayersMock: UserDrawingLayer[] = [UserDrawingLayer.Drawings];

    const actual = selectUserDrawingsVectorLayers.projector(drawingsMock, visibleLayersMock);

    expect(actual.drawings.geojson.features.length).toEqual(1);
    expect(actual.measurements.geojson.features.length).toEqual(0);
  });
});
