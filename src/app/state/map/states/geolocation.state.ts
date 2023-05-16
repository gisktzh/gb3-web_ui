import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

export interface GeolocationState extends HasLoadingState {
  errorReason: string | undefined;
  currentGpsLocation: PointWithSrs | undefined;
}
