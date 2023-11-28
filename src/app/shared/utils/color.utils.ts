import {SymbolizationColor} from '../interfaces/symbolization.interface';

export class ColorUtils {
  public static convertHexToSymbolizationColor(hex: string, a: number = 1.0): SymbolizationColor {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return {r, g, b, a};
  }

  /**
   * Converts an RGB representation to HEX.
   *
   * @see https://stackoverflow.com/a/39077686
   */
  public static convertRGBToHex({r, g, b}: SymbolizationColor): string {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }
}
