export interface TimeService {
  getDateFromString: (date: string, format?: string) => Date; // todo: create a type for the format

  getDateAsFormattedString: (date: Date, format: string) => string; // todo: create a type for the format

  /**
   * Converts a date into UTC and returns it as (optionally formatted) string.
   * @param date
   * @param format
   */
  getDateAsUTCString: (date: Date, format?: string) => string; // todo: create a type for the format

  getDateFromUnixTimestamp: (timestamp: number) => Date;

  /**
   * Returns the difference between two dates in milliseconds.
   */
  calculateDifferenceBetweenDates: (firstDate: Date, secondDate: Date) => number;

  /**
   * Given a date and a unit, this method returns the partial value of the given date.
   * @param date
   * @param unit
   */
  getPartialFromString(date: string, unit: DateUnit): number; // todo: create a type for the unit

  isDate: (value: string) => boolean;

  getUTCDateFromString: (date: string, format?: string) => Date;
}

// base on Dayjs.UnitTypeShort; but it's basically normal iso8601 date units? -> check
export type DateUnit = 'd' | 'D' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms';
