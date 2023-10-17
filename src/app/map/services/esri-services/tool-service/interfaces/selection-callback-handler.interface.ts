import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';

export interface SelectionCallbackHandler {
  complete: (selection: DataDownloadSelection) => void;
  abort: () => void;
}
