import {LoadingState} from '../types/loading-state.type';

/**
 * Generic interface which can be extended for all aspects of the app that should have a loading state.
 */
export interface HasLoadingState {
  loadingState: LoadingState;
}
