import {PrintCreation, PrintCreationResponse, PrintInfo} from '../../../shared/interfaces/print.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface PrintState {
  info: PrintInfo | undefined;
  infoLoadingState: LoadingState;
  creation: PrintCreation | undefined;
  creationLoadingState: LoadingState;
  creationResponse: PrintCreationResponse | undefined;
}
