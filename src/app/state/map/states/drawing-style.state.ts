import {SymbolizationColor} from '../../../shared/interfaces/symbolization.interface';

export interface DrawingStyleState {
  lineColor: SymbolizationColor | undefined;
  fillColor: SymbolizationColor | undefined;
  lineWidth: string | undefined;
}
