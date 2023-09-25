import {initialState, reducer} from './print.reducer';
import {PrintState} from '../states/print.state';
import {PrintCapabilities, PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {PrintActions} from '../actions/print.actions';

describe('print reducer', () => {
  const capabilitiesMock: PrintCapabilities = {
    formats: ['pdf', 'png', 'tif', 'gif'],
    dpis: [300, 150],
    reports: [
      {
        layout: 'A4',
        orientation: 'hoch',
        map: {
          width: 520,
          height: 660,
        },
      },
      {
        layout: 'Kartenset',
        orientation: undefined,
        map: {
          width: 520,
          height: 660,
        },
      },
    ],
  };
  const creationMock: PrintCreation = {
    format: 'tschif',
    reportLayout: 'mobile',
    reportOrientation: 'hoch',
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
            myCustomParamOne: 'myCustomValue',
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
      capabilities: capabilitiesMock,
      capabilitiesLoadingState: 'loaded',
      creation: creationMock,
      creationLoadingState: 'loaded',
      creationResponse: creationResponseMock,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadPrintCapabilities', () => {
    describe('if there are no capabilities loaded yet', () => {
      it('sets the print capabilities loading state to `loading` and resets rest of the state', () => {
        existingState.capabilities = undefined;
        const action = PrintActions.loadPrintCapabilities();
        const state = reducer(existingState, action);

        expect(state.capabilities).toBe(initialState.capabilities);
        expect(state.capabilitiesLoadingState).toBe('loading');
        expect(state.creation).toBe(initialState.creation);
        expect(state.creationLoadingState).toBe(initialState.creationLoadingState);
        expect(state.creationResponse).toBe(initialState.creationResponse);
      });
    });
    describe('if there are already capabilities loaded', () => {
      it('changes nothing', () => {
        const action = PrintActions.loadPrintCapabilities();
        const state = reducer(existingState, action);

        expect(state.capabilities).toBe(existingState.capabilities);
        expect(state.capabilitiesLoadingState).toBe(existingState.capabilitiesLoadingState);
        expect(state.creation).toBe(existingState.creation);
        expect(state.creationLoadingState).toBe(existingState.creationLoadingState);
        expect(state.creationResponse).toBe(existingState.creationResponse);
      });
    });
  });

  describe('setPrintCapabilities', () => {
    it('sets the print capabilities loading state to `loaded` on success and sets the capabilities', () => {
      existingState.capabilitiesLoadingState = 'loading';
      existingState.capabilities = undefined;
      const action = PrintActions.setPrintCapabilities({capabilities: capabilitiesMock});
      const state = reducer(existingState, action);

      expect(state.capabilities).toBe(capabilitiesMock);
      expect(state.capabilitiesLoadingState).toBe('loaded');
      expect(state.creation).toBe(existingState.creation);
      expect(state.creationLoadingState).toBe(existingState.creationLoadingState);
      expect(state.creationResponse).toBe(existingState.creationResponse);
    });
  });

  describe('setPrintCapabilitiesError', () => {
    it('sets the print capabilities loading state to `error` on failure and resets state', () => {
      const action = PrintActions.setPrintCapabilitiesError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.capabilities).toBe(initialState.capabilities);
      expect(state.capabilitiesLoadingState).toBe('error');
      expect(state.creation).toBe(initialState.creation);
      expect(state.creationLoadingState).toBe(initialState.creationLoadingState);
      expect(state.creationResponse).toBe(initialState.creationResponse);
    });
  });

  describe('requestPrintCreation', () => {
    it('sets the print creation loading state to `loading`, sets the print creation item and resets print creation response', () => {
      existingState.creation = undefined;
      const action = PrintActions.requestPrintCreation({creation: creationMock});
      const state = reducer(existingState, action);

      expect(state.capabilities).toBe(existingState.capabilities);
      expect(state.capabilitiesLoadingState).toBe(existingState.capabilitiesLoadingState);
      expect(state.creation).toBe(creationMock);
      expect(state.creationLoadingState).toBe('loading');
      expect(state.creationResponse).toBe(existingState.creationResponse);
    });
  });

  describe('setPrintCreationResponse', () => {
    it('sets the print creation loading state to `loaded` on success and sets the creation response', () => {
      existingState.creationLoadingState = 'loading';
      existingState.creationResponse = undefined;
      const action = PrintActions.setPrintCreationResponse({creationResponse: creationResponseMock});
      const state = reducer(existingState, action);

      expect(state.capabilities).toBe(existingState.capabilities);
      expect(state.capabilitiesLoadingState).toBe(existingState.capabilitiesLoadingState);
      expect(state.creation).toBe(existingState.creation);
      expect(state.creationLoadingState).toBe('loaded');
      expect(state.creationResponse).toBe(creationResponseMock);
    });
  });

  describe('setPrintCreationError', () => {
    it('sets the print creation loading state to `error` on failure and resets creation response', () => {
      const action = PrintActions.setPrintCreationError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.capabilities).toBe(existingState.capabilities);
      expect(state.capabilitiesLoadingState).toBe(existingState.capabilitiesLoadingState);
      expect(state.creation).toBe(existingState.creation);
      expect(state.creationLoadingState).toBe('error');
      expect(state.creationResponse).toBe(initialState.creationResponse);
    });
  });

  describe('clearPrintCreation', () => {
    it('clears the print creating by resetting creation, its loading state and the response to initial state', () => {
      const action = PrintActions.clearPrintCreation();
      const state = reducer(existingState, action);

      expect(state.capabilities).toBe(existingState.capabilities);
      expect(state.capabilitiesLoadingState).toBe(existingState.capabilitiesLoadingState);
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
