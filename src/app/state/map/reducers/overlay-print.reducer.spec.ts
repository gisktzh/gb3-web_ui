import {initialState, reducer} from './overlay-print.reducer';
import {OverlayPrintActions} from '../actions/overlay-print-actions';

describe('OverlayPrint Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('print', () => {
    it('sets the legendPrintState when printing a legend', () => {
      const action = OverlayPrintActions.sendPrintRequest({overlay: 'legend'});

      const result = reducer(initialState, action);

      expect(result.legendPrintState).toEqual('loading');
      expect(result.featureInfoPrintState).toEqual(initialState.featureInfoPrintState);
    });

    it('sets the featureInfoPrintState when printing a feature info', () => {
      const action = OverlayPrintActions.sendPrintRequest({overlay: 'featureInfo'});

      const result = reducer(initialState, action);

      expect(result.legendPrintState).toEqual(initialState.legendPrintState);
      expect(result.featureInfoPrintState).toEqual('loading');
    });
  });

  describe('setPrintRequestResponse', () => {
    it('sets the legendPrintState when a legend was printed', () => {
      const action = OverlayPrintActions.setPrintRequestResponse({overlay: 'legend', creationResponse: {reportUrl: ''}});

      const result = reducer(initialState, action);

      expect(result.legendPrintState).toEqual('loaded');
      expect(result.featureInfoPrintState).toEqual(initialState.featureInfoPrintState);
    });

    it('sets the featureInfoPrintState when a feature info was printed', () => {
      const action = OverlayPrintActions.setPrintRequestResponse({overlay: 'featureInfo', creationResponse: {reportUrl: ''}});

      const result = reducer(initialState, action);

      expect(result.legendPrintState).toEqual(initialState.legendPrintState);
      expect(result.featureInfoPrintState).toEqual('loaded');
    });
  });

  describe('setPrintRequestError', () => {
    it('sets the legendPrintState to undefined when a legend print had an error', () => {
      const action = OverlayPrintActions.setPrintRequestError({overlay: 'legend'});

      const result = reducer(initialState, action);

      expect(result.legendPrintState).toEqual(undefined);
      expect(result.featureInfoPrintState).toEqual(initialState.featureInfoPrintState);
    });

    it('sets the featureInfoPrintState to undefined when a feature info print had an error', () => {
      const action = OverlayPrintActions.setPrintRequestError({overlay: 'featureInfo'});

      const result = reducer(initialState, action);

      expect(result.legendPrintState).toEqual(initialState.legendPrintState);
      expect(result.featureInfoPrintState).toEqual(undefined);
    });
  });
});
