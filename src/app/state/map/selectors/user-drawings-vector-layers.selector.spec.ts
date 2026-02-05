import {selectUserDrawingsVectorLayers} from './user-drawings-vector-layers.selector';
import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

describe('selectUserDrawingsVectorLayers', () => {
  it('correctly assigns drawings to their layer', () => {
    const drawingsMock: Gb3StyledInternalDrawingRepresentation[] = [
      {
        id: 'a',
        labelText: 'a',
        source: UserDrawingLayer.Drawings,
        properties: {style: {type: 'point'}},
      } as Gb3StyledInternalDrawingRepresentation,
      {
        id: 'b',
        labelText: 'b',
        source: UserDrawingLayer.Measurements,
        properties: {style: {type: 'point'}},
      } as Gb3StyledInternalDrawingRepresentation,
    ];
    const visibleLayersMock: UserDrawingLayer[] = [UserDrawingLayer.Measurements, UserDrawingLayer.Drawings];

    const actual = selectUserDrawingsVectorLayers.projector(drawingsMock, visibleLayersMock);

    expect(actual.drawings[0].labelText).toEqual(drawingsMock[0].labelText);
    expect(actual.measurements[0].labelText).toEqual(drawingsMock[1].labelText);
  });

  it("does not add invisible layers' features", () => {
    const drawingsMock: Gb3StyledInternalDrawingRepresentation[] = [
      {
        id: 'a',
        labelText: 'a',
        source: UserDrawingLayer.Drawings,
        properties: {style: {type: 'point'}},
      } as Gb3StyledInternalDrawingRepresentation,
      {
        id: 'b',
        labelText: 'b',
        source: UserDrawingLayer.Measurements,
        properties: {style: {type: 'point'}},
      } as Gb3StyledInternalDrawingRepresentation,
    ];
    const visibleLayersMock: UserDrawingLayer[] = [UserDrawingLayer.Drawings];

    const actual = selectUserDrawingsVectorLayers.projector(drawingsMock, visibleLayersMock);

    expect(actual.drawings.length).toEqual(1);
    expect(actual.measurements.length).toEqual(0);
  });
});
