import {initialState, reducer} from './import.reducer';
import {ImportActions} from '../actions/import.actions';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {DrawingLayerPrefix, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

describe('Import Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
  describe('requestExportDrawings', () => {
    it('sets the loading state to loading', () => {
      const file: File = new File([''], 'filename', {type: 'text/plain'});
      const action = ImportActions.requestDrawingsImport({file});
      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual('loading');
    });
  });
  describe('addDrawingToMap', () => {
    it('sets the loading state to loaded', () => {
      const activeMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, DrawingLayerPrefix.Drawing);
      const action = ImportActions.addDrawingToMap({activeMapItem, drawingsToAdd: [], drawingLayersToOverride: []});
      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual('loaded');
    });
  });
  describe('setDrawingsImportRequestError', () => {
    it('sets the loading state to error', () => {
      const action = ImportActions.setDrawingsImportRequestError({});
      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual('error');
    });
  });
  describe('resetDrawingImportState', () => {
    it('resets the ImportState', () => {
      const action = ImportActions.resetDrawingImportState();
      const result = reducer(initialState, action);

      expect(result.loadingState).toEqual(undefined);
    });
  });
});
