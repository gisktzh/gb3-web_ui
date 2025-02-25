export class TypeUtils {
  /**
   * Allows to check for the newly added (4.32) `nullish` type.
   * @param value
   */
  public static isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  /**
   * Checks if the given object has a non-nullish property at a specific key.
   */
  public static hasNonNullish<T, K extends keyof T>(obj: T, key: K): obj is T & {[P in K]: NonNullable<T[P]>} {
    return !TypeUtils.isNullish(obj[key]);
  }
}
