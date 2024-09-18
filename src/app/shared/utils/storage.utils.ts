import {DayjsUtils} from './dayjs.utils';

export class StorageUtils {
  /**
   *   Returns a date in the correct format after parsing from stringified Object. This is used within the JSON.parse method, hence the
   *   "any" type for the value parameter.
   *
   *   The comment below refers to the implementation in the DayjsTimeService, which has been created to have all dayjs related methods in one place.
   *   This comment is only really refering to this specific usecase of the isValidDate method, which is why the comment is not in the DayjsTimeService itself.
   *
   *   Note that we're not using the "strict" mode of "dayjs.isValid" here, because we parse a stringified date that was created by using
   *   JSON.stringify(). This uses the ISO8601 format, which looks like YYYY-MM-DDTHH:mm:ss.SSSZ. The strict mode for dayjs() does not work
   *   properly with the "Z" parameter (see e.g. https://github.com/iamkun/dayjs/issues/1729), although it theoretically should. Instead of
   *   hacking this and replacing the "Z" with an empty string, we just use the default mode of dayjs() here. However, this has the issue
   *   that e.g. "12" is valid and parsed as a date. Therefore, we check whether the parsed string's ISO string representation is equal to
   *   the original string. If it is, we return the parsed date, otherwise the original string (see GB3-1597).
   */
  private static reviver(key: string, value: any): any {
    if (typeof value === 'string' && DayjsUtils.isValidDate(value)) {
      const parsed = DayjsUtils.parseUTCDate(value);
      return parsed.toISOString() === value ? parsed : value;
    }
    return value;
  }

  public static parseJson<T>(value: string): T {
    return JSON.parse(value, StorageUtils.reviver);
  }

  public static stringifyJson<T>(value: T): string {
    return JSON.stringify(value);
  }
}
