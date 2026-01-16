import {Gb3StyleRepresentation, Gb3SymbolStyle} from '../interfaces/internal-drawing-representation.interface';

export class Gb3SymbolStyleUtils {
  public static isGb3SymbolStyle(style: Gb3StyleRepresentation): style is Gb3SymbolStyle {
    return style.type === 'symbol';
  }
}
