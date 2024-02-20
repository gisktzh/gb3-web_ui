export class NumberUtils {
  /**
   * Rounds numbers simply to the specified number of decimals or none, if decimals is smaller than 1 or undefined.
   *
   * Internally uses Math.round(), so take it with a grain of salt (e.g., as is mathematically correct, does not guarantee the number of
   * decimals. It does for example nothing if the value is 5.55 but the specified decimals is 20.
   * @param value
   * @param decimals
   */
  public static roundToDecimals(value: number, decimals?: number): number {
    if (!decimals || decimals < 1 || !Number.isSafeInteger(decimals)) {
      return Math.round(value);
    }
    const multiplierAndDivisor = 10 ** decimals;
    return Math.round(value * multiplierAndDivisor) / multiplierAndDivisor;
  }

  /**
   * Tries to extract a number from a mixed input string by eliminating all non-numeric characters while also accounting for decimal
   * notation. If it cannot extract a valid number, it will return undefined.
   * @param mixedString
   */
  public static parseNumberFromMixedString(mixedString: string): number | undefined {
    const possibleNumber = parseFloat(mixedString.replace(/[^\d.]/g, ''));
    return isNaN(possibleNumber) ? undefined : possibleNumber;
  }
}
