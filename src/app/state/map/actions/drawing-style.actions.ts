import {createActionGroup, props} from '@ngrx/store';
import {SymbolizationColor} from '../../../shared/interfaces/symbolization.interface';

export const DrawingStyleActions = createActionGroup({
  source: 'DrawingStyle',
  events: {
    'Set Line Color': props<{color: SymbolizationColor}>(),
    'Set Fill Color': props<{color: SymbolizationColor}>(),
    'Set Line Width': props<{width: number}>(),
  },
});
