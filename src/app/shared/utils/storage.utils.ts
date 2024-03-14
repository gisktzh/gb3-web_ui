import dayjs from 'dayjs';
import {TimeExtentUtils} from './time-extent.utils';

export class StorageUtils {
  // Returns a date in the correct format after parsing from stringified Object. This is used within the JSON.parse method, hence the "any" type for the value parameter
  private static reviver(key: string, value: any): any {
    if (typeof value === 'string' && dayjs(value).isValid()) {
      return TimeExtentUtils.parseDefaultUTCDate(value);
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
