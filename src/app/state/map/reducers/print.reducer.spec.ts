import {initialState, reducer} from './print.reducer';
import {PrintState} from '../states/print.state';
import {PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {PrintActions} from '../actions/print.actions';

describe('print reducer', () => {
  const creationMock: PrintCreation = {
    reportType: 'standard',
    format: 'tschif',
    reportLayout: 'mobile',
    reportOrientation: 'portrait',
    attributes: {
      reportTitle: 'Passierschein a38',
      userTitle: 'Haus, das Verrückte macht',
      userComment: 'Die Spinnen, die Römer',
      showLegend: true,
    },
    map: {
      dpi: 9001,
      rotation: 42,
      scale: 123_456_789,
      center: [12.3, 45.6],
      mapItems: [
        {
          type: 'WMS',
          mapTitle: 'karte 1',
          customParams: {
            format: 'image/png; mode=8bit',
            transparent: true,
            dynamicStringParams: {
              myCustomParamOne: 'myCustomValue',
            },
          },
          background: false,
          layers: ['gott', 'würfelt', 'nicht'],
          url: 'url 1',
          opacity: 0.666,
        },
      ],
    },
  };
  const creationResponseMock: PrintCreationResponse = {reportUrl: 'response url'};

  const errorMock: Error = new Error('oh no! anyway...');
  let existingState: PrintState;

  beforeEach(() => {
    existingState = {
      creation: creationMock,
      creationLoadingState: 'loaded',
      creationResponse: creationResponseMock,
      capabilitiesValidCombinations: [],
      capabilitiesValidCombinationsLoadingState: undefined,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('requestPrintCreation', () => {
    it('sets the print creation loading state to `loading`, sets the print creation item and resets print creation response', () => {
      existingState.creation = undefined;
      const action = PrintActions.requestPrintCreation({creation: creationMock});
      const state = reducer(existingState, action);

      expect(state.creation).toBe(creationMock);
      expect(state.creationLoadingState).toBe('loading');
      expect(state.creationResponse).toBe(existingState.creationResponse);
    });
  });

  describe('setPrintRequestResponse', () => {
    it('sets the print creation loading state to `loaded` on success and sets the creation response', () => {
      existingState.creationLoadingState = 'loading';
      existingState.creationResponse = undefined;
      const action = PrintActions.setPrintRequestResponse({creationResponse: creationResponseMock});
      const state = reducer(existingState, action);

      expect(state.creation).toBe(existingState.creation);
      expect(state.creationLoadingState).toBe('loaded');
      expect(state.creationResponse).toBe(creationResponseMock);
    });
  });

  describe('setPrintRequestError', () => {
    it('sets the print creation loading state to `error` on failure and resets creation response', () => {
      const action = PrintActions.setPrintRequestError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.creation).toBe(existingState.creation);
      expect(state.creationLoadingState).toBe('error');
      expect(state.creationResponse).toBe(initialState.creationResponse);
    });
  });

  describe('clearPrintRequest', () => {
    it('clears the print request by resetting the creation object, its loading state and the response to initial state', () => {
      const action = PrintActions.clearPrintRequest();
      const state = reducer(existingState, action);

      expect(state.creation).toBe(initialState.creation);
      expect(state.creationLoadingState).toBe(initialState.creationLoadingState);
      expect(state.creationResponse).toBe(initialState.creationResponse);
    });
  });

  describe('showPrintPreview', () => {
    it('does not change the state', () => {
      const action = PrintActions.showPrintPreview({height: 1, width: 3, scale: 3, rotation: 7});
      const state = reducer(existingState, action);

      expect(state).toEqual(existingState);
    });
  });

  describe('removePrintPreview', () => {
    it('does not change the state', () => {
      const action = PrintActions.removePrintPreview();
      const state = reducer(existingState, action);

      expect(state).toEqual(existingState);
    });
  });
});
