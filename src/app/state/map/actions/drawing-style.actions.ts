import {createActionGroup, props} from '@ngrx/store';
import {SymbolizationColor} from '../../../shared/interfaces/symbolization.interface';

export const DrawingStyleActions = createActionGroup({
  source: 'DrawingStyle',
  events: {
    'Set Drawing Styles': props<{fillColor: SymbolizationColor; lineColor: SymbolizationColor; lineWidth: number}>(),
  },
});
