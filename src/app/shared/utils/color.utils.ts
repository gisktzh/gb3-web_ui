import {SymbolizationColor} from '../interfaces/symbolization.interface';

export class ColorUtils {
  // todo GB3-826: add failure-tolerant cases (e.g. return black if it cannot be parsed; parse #FFA short cases example)
  public static convertHexToSymbolizationColor(hex: string, a: number = 1.0): SymbolizationColor {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return {r, g, b, a};
  }

  public static convertSymbolizatioColorToHex(color: SymbolizationColor) {
    return `#${this.rgbToHex(color.r)}${this.rgbToHex(color.g)}${this.rgbToHex(color.b)}`;
  }

  private static rgbToHex(value: number): string {
    return value.toString(16).padStart(2, '0');
  }
}
