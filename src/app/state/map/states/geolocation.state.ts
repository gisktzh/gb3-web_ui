import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';

export interface GeolocationState extends HasLoadingState {
  errorReason: string | undefined;
}
