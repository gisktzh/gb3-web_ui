import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export interface GeolocationState extends HasLoadingState {
  errorReason: string | undefined; // todo: check whether this should be part of HasLoadingState
  currentGpsLocation: PointWithSrs | undefined;
}
