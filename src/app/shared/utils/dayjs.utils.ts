import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export class DayjsUtils {
  public static parseUTCDate(date: string, format?: string): Date {
    return dayjs.utc(date, format).toDate();
  }
}
