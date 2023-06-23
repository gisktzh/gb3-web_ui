import {PrintCreation, PrintCreationResponse, PrintInfo} from '../../../shared/interfaces/print.interface';
import {LoadingState} from '../../../shared/types/loading-state';

export interface PrintState {
  printInfo: PrintInfo | undefined;
  printInfoLoadingState: LoadingState;
  printCreation: PrintCreation | undefined;
  printCreationLoadingState: LoadingState;
  printCreationResponse: PrintCreationResponse | undefined;
}
