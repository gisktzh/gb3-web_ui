import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {GeneralInfoResponse} from '../../../shared/interfaces/general-info.interface';

export interface GeneralInfoState extends HasLoadingState {
  data: GeneralInfoResponse | undefined;
}
