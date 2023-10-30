import {createFeature, createReducer, on} from '@ngrx/store';
import {OverlayPrintState} from '../states/overlay-print.state';
import {OverlayPrintActions} from '../actions/overlay-print-actions';

export const overlayPrintFeatureKey = 'overlayPrint';

export const initialState: OverlayPrintState = {
  legendPrintState: undefined,
  featureInfoPrintState: undefined,
};

export const overlayPrintFeature = createFeature({
  name: overlayPrintFeatureKey,
  reducer: createReducer(
    initialState,
    on(OverlayPrintActions.print, (state, {overlay}): OverlayPrintState => {
      switch (overlay) {
        case 'legend':
          return {...state, legendPrintState: 'loading'};
        case 'featureInfo':
          return {...state, featureInfoPrintState: 'loading'};
      }
    }),
    on(OverlayPrintActions.setPrintRequestResponse, (state, {overlay}): OverlayPrintState => {
      switch (overlay) {
        case 'legend':
          return {...state, legendPrintState: 'loaded'};
        case 'featureInfo':
          return {...state, featureInfoPrintState: 'loaded'};
      }
    }),
    on(OverlayPrintActions.setPrintRequestError, (state, {overlay}): OverlayPrintState => {
      // we do not show an error state for the overlays, so we set the error state to undefined in case of an API error
      switch (overlay) {
        case 'legend':
          return {...state, legendPrintState: undefined};
        case 'featureInfo':
          return {...state, featureInfoPrintState: undefined};
      }
    }),
  ),
});

export const {name, reducer, selectFeatureInfoPrintState, selectLegendPrintState} = overlayPrintFeature;
