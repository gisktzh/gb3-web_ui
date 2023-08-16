import {ViewProcessState} from '../../shared/types/view-process-state.type';

export interface HasViewProcessState {
  /** True if the layer is currently visible */
  viewProcessState: ViewProcessState;
}
