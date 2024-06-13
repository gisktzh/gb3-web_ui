import {ExportFormat} from '../../../shared/enums/export-format.enum';
import {LoadingState} from '../../../shared/types/loading-state.type';

export interface ExportState {
  exportFormat: ExportFormat | undefined;
  exportLoadingState: LoadingState;
}
