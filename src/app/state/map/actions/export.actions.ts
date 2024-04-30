import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ExportFormat} from '../../../shared/types/export-format.type';
import {errorProps} from '../../../shared/utils/error-props.utils';

export const ExportActions = createActionGroup({
  source: 'Export',
  events: {
    'Request Export Drawings': props<{exportFormat: ExportFormat}>(),
    'Set Export Drawings Request Response': emptyProps(),
    'Set Export Drawings Request Error': errorProps(),
  },
});
