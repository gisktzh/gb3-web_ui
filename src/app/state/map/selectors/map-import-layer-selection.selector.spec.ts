import {
  selectAllSelectedLayer,
  selectAreAllLayersSelected,
  selectAreSomeButNotAllLayersSelected,
  selectIsAnyLayerSelected,
} from './map-import-layer-selection.selector';
import {ExternalLayerSelection} from '../../../shared/interfaces/external-layer-selection.interface';
import {ExternalLayer} from '../../../shared/interfaces/external-layer.interface';

describe('selectAllSelectedLayer', () => {
  it('returns all layers that are selected', () => {
    const layers: ExternalLayer[] = [
      {type: 'kml', id: 1, title: 'one', visible: true},
      {type: 'kml', id: 2, title: 'two', visible: false},
    ];
    const layerSelections: ExternalLayerSelection[] = [
      {layer: layers[0], isSelected: false},
      {layer: layers[1], isSelected: true},
    ];
    const actual = selectAllSelectedLayer.projector(layerSelections);

    const expected: ExternalLayer[] = [layers[1]];

    expect(actual).toEqual(expected);
  });

  it('returns an empty array if the layer selection is undefined', () => {
    const actual = selectAllSelectedLayer.projector(undefined);

    const expected: ExternalLayer[] = [];

    expect(actual).toEqual(expected);
  });
});

describe('selectIsAnyLayerSelected', () => {
  it('returns `true` if at least one layer is selected', () => {
    const layerSelections: ExternalLayerSelection[] = [
      {layer: {type: 'kml', id: 1, title: 'one', visible: true}, isSelected: false},
      {layer: {type: 'kml', id: 2, title: 'two', visible: false}, isSelected: true},
    ];
    const actual = selectIsAnyLayerSelected.projector(layerSelections);

    const expected = true;

    expect(actual).toBe(expected);
  });

  it('returns `false` if no layer is selected', () => {
    const layerSelections: ExternalLayerSelection[] = [
      {layer: {type: 'kml', id: 1, title: 'one', visible: true}, isSelected: false},
      {layer: {type: 'kml', id: 2, title: 'two', visible: false}, isSelected: false},
    ];
    const actual = selectIsAnyLayerSelected.projector(layerSelections);

    const expected = false;

    expect(actual).toBe(expected);
  });

  it('returns `false` if the layer selection is undefined', () => {
    const actual = selectIsAnyLayerSelected.projector(undefined);

    const expected = false;

    expect(actual).toBe(expected);
  });
});

describe('selectAreAllLayersSelected', () => {
  it('returns `true` if all layers are selected', () => {
    const layerSelections: ExternalLayerSelection[] = [
      {layer: {type: 'kml', id: 1, title: 'one', visible: true}, isSelected: true},
      {layer: {type: 'kml', id: 2, title: 'two', visible: false}, isSelected: true},
    ];
    const actual = selectAreAllLayersSelected.projector(layerSelections);

    const expected = true;

    expect(actual).toBe(expected);
  });

  it('returns `false` if at least one layer is not selected', () => {
    const layerSelections: ExternalLayerSelection[] = [
      {layer: {type: 'kml', id: 1, title: 'one', visible: true}, isSelected: false},
      {layer: {type: 'kml', id: 2, title: 'two', visible: false}, isSelected: true},
    ];
    const actual = selectAreAllLayersSelected.projector(layerSelections);

    const expected = false;

    expect(actual).toBe(expected);
  });

  it('returns `false` if the layer selection is undefined', () => {
    const actual = selectAreAllLayersSelected.projector(undefined);

    const expected = false;

    expect(actual).toBe(expected);
  });
});

describe('selectAreSomeButNotAllLayersSelected', () => {
  it('returns `true` if at least one layer is selected but not all', () => {
    const areAllLayersSelected = false;
    const isAnyLayerSelected = true;
    const actual = selectAreSomeButNotAllLayersSelected.projector(areAllLayersSelected, isAnyLayerSelected);

    const expected = true;

    expect(actual).toBe(expected);
  });

  it('returns `false` if all layers are selected', () => {
    const areAllLayersSelected = true;
    const isAnyLayerSelected = true;
    const actual = selectAreSomeButNotAllLayersSelected.projector(areAllLayersSelected, isAnyLayerSelected);

    const expected = false;

    expect(actual).toBe(expected);
  });

  it('returns `false` if no layer is selected', () => {
    const areAllLayersSelected = false;
    const isAnyLayerSelected = false;
    const actual = selectAreSomeButNotAllLayersSelected.projector(areAllLayersSelected, isAnyLayerSelected);

    const expected = false;

    expect(actual).toBe(expected);
  });
});
