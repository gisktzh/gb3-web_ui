import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';

export interface ElevationProfileState extends HasLoadingState {
  data: ElevationProfileData | undefined;
  downloadLink: string;
}
