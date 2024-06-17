import {initialState, reducer} from './export.reducer';
import {ExportActions} from '../actions/export.actions';
import {ExportFormat} from '../../../shared/enums/export-format.enum';

describe('Export Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
  describe('requestExportDrawings', () => {
    it('sets the loading state and export format', () => {
      const exportFormat: ExportFormat = ExportFormat.Geojson;
      const action = ExportActions.requestDrawingsExport({exportFormat});
      const result = reducer(initialState, action);

      expect(result.exportLoadingState).toEqual('loading');
      expect(result.exportFormat).toEqual(exportFormat);
    });
  });
  describe('setExportDrawingsRequestResponse', () => {
    it('sets the loading state', () => {
      const action = ExportActions.setDrawingsExportRequestResponse();
      const result = reducer(initialState, action);

      expect(result.exportLoadingState).toEqual('loaded');
    });
  });
  describe('setExportDrawingsRequestError', () => {
    it('sets the loading state and clears the export format', () => {
      const action = ExportActions.setDrawingsExportRequestError({});
      const result = reducer(initialState, action);

      expect(result.exportLoadingState).toEqual('error');
      expect(result.exportFormat).toBeUndefined();
    });
  });
});
