export class FormValueConversionUtils {
  public static getStringOrDefaultValue(stringValue: string | null | undefined): string {
    if (stringValue === undefined || stringValue === null) {
      return '';
    }
    return stringValue;
  }

  public static getNumberOrDefaultValue(numberValue: number | null | undefined): number {
    if (numberValue === undefined || numberValue === null) {
      return 0;
    }
    return numberValue;
  }

  public static getBooleanOrDefaultValue(booleanValue: boolean | null | undefined): boolean {
    if (booleanValue === undefined || booleanValue === null) {
      return false;
    }
    return booleanValue;
  }

  public static getArrayOrDefaultValue<T>(arrayValue: T[] | null | undefined): T[] {
    if (arrayValue === undefined || arrayValue === null) {
      return [];
    }
    return arrayValue;
  }
}
