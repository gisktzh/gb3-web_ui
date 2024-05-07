import {PrintCreation, PrintCreationResponse} from '../../../shared/interfaces/print.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface PrintState {
  creation: PrintCreation | undefined;
  creationLoadingState: LoadingState;
  creationResponse: PrintCreationResponse | undefined;
}
