import {ExportFormat} from '../../../shared/types/export-format.type';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface ExportState {
  exportFormat: ExportFormat | undefined;
  exportLoadingState: LoadingState;
}
