import {ViewProcessState} from '../../shared/types/view-process-state';

export interface HasViewProcessState {
  /** True if the layer is currently visible */
  viewProcessState: ViewProcessState;
}
