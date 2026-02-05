import {Gb3StyleRepresentation, Gb3SymbolStyle} from '../interfaces/internal-drawing-representation.interface';

export function isGb3SymbolStyle(style: Gb3StyleRepresentation): style is Gb3SymbolStyle {
  return style.type === 'symbol';
}
