import {initialState, reducer} from './map-import.reducer';
import {MapImportState} from '../states/map-import.state';
import {MapImportActions} from '../actions/map-import.actions';
import {MapServiceType} from '../../../map/types/map-service.type';
import {ExternalLayerSelection} from '../../../shared/interfaces/external-layer-selection.interface';
import {ExternalLayer} from '../../../shared/interfaces/external-layer.interface';

describe('map import reducer', () => {
  let existingState: MapImportState;

  beforeEach(() => {
    existingState = {
      serviceType: 'kml',
      url: 'the-bestest-url-of-them-all',
      title: 'title of the year',
      imageFormat: 'format c:/',
      layerSelections: [],
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('setServiceType', () => {
    it('sets the service type; resets everything else', () => {
      const expectedServiceType: MapServiceType = 'wms';

      const action = MapImportActions.setServiceType({serviceType: expectedServiceType});
      const state = reducer(existingState, action);

      expect(state.serviceType).toBe(expectedServiceType);
      expect(state.url).toBe(initialState.url);
      expect(state.title).toBe(initialState.title);
      expect(state.imageFormat).toBe(initialState.imageFormat);
      expect(state.layerSelections).toEqual(initialState.layerSelections);
    });
  });

  describe('setUrl', () => {
    it('sets the url; keeps the service type but resets everything else', () => {
      const expectedUrl = 'new url';

      const action = MapImportActions.setUrl({url: expectedUrl});
      const state = reducer(existingState, action);

      expect(state.serviceType).toBe(existingState.serviceType);
      expect(state.url).toBe(expectedUrl);
      expect(state.title).toBe(initialState.title);
      expect(state.imageFormat).toBe(initialState.imageFormat);
      expect(state.layerSelections).toEqual(initialState.layerSelections);
    });
  });

  describe('setLayersAndImageFormat', () => {
    it('sets the layerSelections and the image format; keeps everything else', () => {
      const layers: ExternalLayer[] = [
        {type: 'kml', id: 1, title: 'one', visible: true},
        {type: 'kml', id: 2, title: 'two', visible: false},
      ];

      const expectedImageFormat = 'image/jpg';
      const expectedLayerSelections: ExternalLayerSelection[] = [
        {layer: layers[0], isSelected: false},
        {layer: layers[1], isSelected: false},
      ];

      const action = MapImportActions.setLayersAndImageFormat({layers, imageFormat: expectedImageFormat});
      const state = reducer(existingState, action);

      expect(state.serviceType).toBe(existingState.serviceType);
      expect(state.url).toBe(existingState.url);
      expect(state.title).toBe(existingState.title);
      expect(state.imageFormat).toBe(expectedImageFormat);
      expect(state.layerSelections).toEqual(expectedLayerSelections);
    });
  });

  describe('selectAllLayers', () => {
    it('sets all layer selections to the given value; keeps everything else', () => {
      const layerSelections: ExternalLayerSelection[] = [
        {layer: {type: 'kml', id: 1, title: 'one', visible: true}, isSelected: false},
        {layer: {type: 'kml', id: 2, title: 'two', visible: false}, isSelected: true},
      ];
      existingState.layerSelections = layerSelections;
      const isSelected = false;

      const expectedLayerSelections: ExternalLayerSelection[] = [
        {...layerSelections[0], isSelected},
        {...layerSelections[1], isSelected},
      ];

      const action = MapImportActions.selectAllLayers({isSelected});
      const state = reducer(existingState, action);

      expect(state.serviceType).toBe(existingState.serviceType);
      expect(state.url).toBe(existingState.url);
      expect(state.title).toBe(existingState.title);
      expect(state.imageFormat).toBe(existingState.imageFormat);
      expect(state.layerSelections).toEqual(expectedLayerSelections);
    });
  });

  describe('toggleLayerSelection', () => {
    it('toggles the selection of the given layer; keeps everything else', () => {
      const layerSelections: ExternalLayerSelection[] = [
        {layer: {type: 'kml', id: 1, title: 'one', visible: true}, isSelected: false},
        {layer: {type: 'kml', id: 2, title: 'two', visible: false}, isSelected: true},
      ];
      existingState.layerSelections = layerSelections;

      const expectedLayerSelections: ExternalLayerSelection[] = [{...layerSelections[0], isSelected: true}, {...layerSelections[1]}];

      const action = MapImportActions.toggleLayerSelection({layerId: layerSelections[0].layer.id});
      const state = reducer(existingState, action);

      expect(state.serviceType).toBe(existingState.serviceType);
      expect(state.url).toBe(existingState.url);
      expect(state.title).toBe(existingState.title);
      expect(state.imageFormat).toBe(existingState.imageFormat);
      expect(state.layerSelections).toEqual(expectedLayerSelections);
    });
  });

  describe('setTitle', () => {
    it('sets the title; keeps everything else', () => {
      const expectedTitle = 'new title';

      const action = MapImportActions.setTitle({title: expectedTitle});
      const state = reducer(existingState, action);

      expect(state.serviceType).toBe(existingState.serviceType);
      expect(state.url).toBe(existingState.url);
      expect(state.title).toBe(expectedTitle);
      expect(state.imageFormat).toBe(existingState.imageFormat);
      expect(state.layerSelections).toEqual(existingState.layerSelections);
    });
  });

  describe('clearAll', () => {
    it('resets everything', () => {
      const action = MapImportActions.clearAll();
      const state = reducer(existingState, action);

      expect(state.serviceType).toBe(initialState.serviceType);
      expect(state.url).toBe(initialState.url);
      expect(state.title).toBe(initialState.title);
      expect(state.imageFormat).toBe(initialState.imageFormat);
      expect(state.layerSelections).toEqual(initialState.layerSelections);
    });
  });
});
