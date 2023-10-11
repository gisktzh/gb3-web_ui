import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';

export const DataDownloadActions = createActionGroup({
  source: 'DataDownload',
  events: {
    'Set Selection': props<{selection: DataDownloadSelection}>(),
    'Clear Selection': emptyProps(),
  },
});
