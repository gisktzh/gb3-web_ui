import {HexColor, SymbolizationColor} from '../interfaces/symbolization.interface';
import {InvalidHexFormat, InvalidRGBFormat} from '../errors/color-format-conversion.errors';

const HEX_FORMAT_LENGTH = 6;

export class ColorUtils {
  public static convertHexToSymbolizationColor(hex: string, a: number = 1.0): SymbolizationColor {
    hex = hex.startsWith('#') ? hex.slice(1) : hex;
    hex = hex.padStart(HEX_FORMAT_LENGTH, '0');

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    if ([r, g, b].some((value) => Number.isNaN(value)) || hex.length > HEX_FORMAT_LENGTH || !this.isValidAlpha(a)) {
      throw new InvalidHexFormat();
    }

    return {r, g, b, a};
  }

  public static convertSymbolizationColorToHex(color: SymbolizationColor): HexColor {
    if (this.isValidColor(color.r) && this.isValidColor(color.g) && this.isValidColor(color.b) && this.isValidAlpha(color.a)) {
      return {
        hexColor: `#${this.rgbToHex(color.r)}${this.rgbToHex(color.g)}${this.rgbToHex(color.b)}`,
        alpha: color.a,
      };
    } else {
      throw new InvalidRGBFormat();
    }
  }

  private static rgbToHex(value: number): string {
    return value.toString(16).padStart(2, '0');
  }

  private static isValidColor(color: number): boolean {
    return color >= 0 && color <= 255;
  }

  private static isValidAlpha(alpha: number): boolean {
    return alpha >= 0.0 && alpha <= 1.0;
  }
}
