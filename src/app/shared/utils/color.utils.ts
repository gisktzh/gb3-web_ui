import {SymbolizationColor} from '../interfaces/symbolization.interface';
import {InvalidHexFormat, InvalidRGBFormat} from '../errors/color-format-conversion.errors';

const HEX_FORMAT_LENGTH = 6;

export class ColorUtils {
  public static convertHexToSymbolizationColor(hex: string, a: number = 1.0): SymbolizationColor {
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    while (hex.length !== HEX_FORMAT_LENGTH) {
      hex = `0${hex}`;
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    a = a > 1.0 ? 1.0 : a;

    if ([r, g, b].some((value) => Number.isNaN(value))) {
      throw new InvalidHexFormat();
    }

    return {r, g, b, a};
  }

  public static convertSymbolizationColorToHex(color: SymbolizationColor) {
    if (color.r <= 255 && color.g <= 255 && color.b <= 255) {
      return `#${this.rgbToHex(color.r)}${this.rgbToHex(color.g)}${this.rgbToHex(color.b)}`;
    } else {
      throw new InvalidRGBFormat();
    }
  }

  private static rgbToHex(value: number): string {
    return value.toString(16).padStart(2, '0');
  }
}
