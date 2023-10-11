import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';

export interface DataDownloadState extends HasLoadingState, HasSavingState {
  selection: DataDownloadSelection | undefined;
}
