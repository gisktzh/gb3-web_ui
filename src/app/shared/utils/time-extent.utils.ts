import {Duration} from 'dayjs/plugin/duration';
import {ManipulateTypeAlias as ManipulateType} from '../types/dayjs-alias-type';
import {TimeSliderConfiguration} from '../interfaces/topic.interface';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';
import {DayjsUtils} from './dayjs.utils';

export class TimeExtentUtils {
  /**
   * Creates an initial time extent based on the given time slider configuration.
   */
  public static createInitialTimeSliderExtent(timeSliderConfig: TimeSliderConfiguration): TimeExtent {
    const minimumDate: Date = DayjsUtils.parseUTCDate(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maximumDate: Date = DayjsUtils.parseUTCDate(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);
    const range: Duration | null = timeSliderConfig.range ? DayjsUtils.getDuration(timeSliderConfig.range) : null;
    return {
      start: minimumDate,
      end: range ? TimeExtentUtils.addDuration(minimumDate, range) : maximumDate,
    };
  }

  /**
   * Extracts the unit from the given duration or <undefined> if it contains values with multiple units.
   *
   * @remarks
   * It does return a unit ('years'/'months'/...) only if the given duration contains values of this unit and nothing else; <undefined>
   *   otherwise.
   *
   * @example
   * 'P3Y' is a duration of 3 years. The duration only contains years and therefore this method returns 'years'
   * 'P1Y6M' is a duration of 1 year and 6 months. It contains years (1) and months (6) which is a mix of two units. The return value will
   *   be <undefined>.
   * */
  public static extractUniqueUnitFromDuration(duration: Duration): ManipulateType | undefined {
    if (duration.years() === duration.asYears()) return 'years';
    if (duration.months() === duration.asMonths()) return 'months';
    if (duration.days() === duration.asDays()) return 'days';
    if (duration.hours() === duration.asHours()) return 'hours';
    if (duration.minutes() === duration.asMinutes()) return 'minutes';
    if (duration.seconds() === duration.asSeconds()) return 'seconds';
    if (duration.milliseconds() === duration.asMilliseconds()) return 'milliseconds';
    return undefined;
  }

  /**
   * Extracts a unit from the given date format (ISO8601) if it contains exactly one or <undefined> if it contains multiple units.
   *
   * @remarks
   * It does return a unit ('years'/'months'/...) only if the given duration contains values of this unit and nothing else; <undefined>
   *   otherwise.
   *
   * @example
   * 'YYYY' is a date format containing only years; The unique unit is years and therefore this method returns 'years'
   * 'H:m s.SSS' is a date format containing hours, minutes, seconds and milliseconds; there are multiple units therefore this method
   *   returns 'undefined'
   * */
  public static extractUniqueUnitFromDateFormat(dateFormat: string): ManipulateType | undefined {
    if (dateFormat.replace(/S/g, '').trim() === '') return 'milliseconds';
    if (dateFormat.replace(/s/g, '').trim() === '') return 'seconds';
    if (dateFormat.replace(/m/g, '').trim() === '') return 'minutes';
    if (dateFormat.replace(/[hH]/g, '').trim() === '') return 'hours';
    if (dateFormat.replace(/[dD]/g, '').trim() === '') return 'days';
    if (dateFormat.replace(/M/g, '').trim() === '') return 'months';
    if (dateFormat.replace(/Y/g, '').trim() === '') return 'years';
    return undefined;
  }

  /**
   * Extracts the smallest unit from the given date format (ISO8601) or <undefined> if nothing matches.
   *
   * @example
   * 'YYYY-MM' is a date format containing years and months; The smallest unit is months (months < years) and therefore this method returns
   *   'months'
   * 'H:m s.SSS' is a date format containing hours, minutes, seconds and milliseconds; The smallest unit is milliseconds and therefore this
   *   method returns 'milliseconds'
   * */
  public static extractSmallestUnitFromDateFormat(dateFormat: string): ManipulateType | undefined {
    if (dateFormat.includes('SSS')) return 'milliseconds';
    if (dateFormat.includes('s')) return 'seconds';
    if (dateFormat.includes('m')) return 'minutes';
    if (dateFormat.toLowerCase().includes('h')) return 'hours'; // both `h` and `H` are used for `hours`
    if (dateFormat.toLowerCase().includes('d')) return 'days'; // both `d` and `D` are used for `days`
    if (dateFormat.includes('M')) return 'months';
    if (dateFormat.includes('Y')) return 'years';
    return undefined;
  }

  /**
   * Adds the duration to the given date as exact as possible.
   *
   * @remarks
   * It does more than a simple `dayjs(date).add(duration)`. It will add values of a specific unit to the date in case that
   * the duration contains only values of one specific unit (e.g. 'years'). This has the advantage that it does not use
   * a generic solution which would be 365 days in case of a year.
   *
   * @example
   * addDuration(01.01.2000, duration(1, 'years')) === 01.01.2001
   * while the default way using `dayjs.add` would lead to an error: dayjs(01.01.2000).add(duration(1, 'years')) === 01.01.2000 + 365 days
   *   === 31.12.2000
   * */
  public static addDuration(date: Date, duration: Duration): Date {
    const unit = TimeExtentUtils.extractUniqueUnitFromDuration(duration);
    if (!unit) {
      return DayjsUtils.addDuration(date, duration);
    }
    const value = TimeExtentUtils.getDurationAsNumber(duration, unit);
    return DayjsUtils.addDuration(date, DayjsUtils.getDurationWithUnit(value, unit));
  }

  /**
   * Subtracts the duration from the given date as exact as possible.
   *
   * @remarks
   * It does more than a simple `dayjs(date).subtract(duration)`. It will subtract values of a specific unit from the date in case that
   * the duration contains only values of one specific unit (e.g. 'years'). This has the advantage that it does not use
   * a generic solution which would be 365 days in case of a year.
   *
   * @example
   * subtractDuration(01.01.2001, duration(1, 'years')) === 01.01.2000
   * while the default way using `dayjs.subtract` would lead to an error: dayjs(01.01.2001).subtract(duration(1, 'years')) === 01.01.2001 -
   *   365 days === 02.01.2000
   * */
  public static subtractDuration(date: Date, duration: Duration): Date {
    const unit = TimeExtentUtils.extractUniqueUnitFromDuration(duration);
    if (!unit) {
      return DayjsUtils.subtractDuration(date, duration);
    }
    const value = TimeExtentUtils.getDurationAsNumber(duration, unit);
    return DayjsUtils.subtractDuration(date, DayjsUtils.getDurationWithUnit(value, unit));
  }

  /**
   * Gets the whole given duration as a number value in the desired unit.
   */
  public static getDurationAsNumber(duration: Duration, unit: ManipulateType): number {
    switch (unit) {
      case 'ms':
      case 'millisecond':
      case 'milliseconds':
        return duration.asMilliseconds();
      case 'second':
      case 'seconds':
      case 's':
        return duration.asSeconds();
      case 'minute':
      case 'minutes':
      case 'm':
        return duration.asMinutes();
      case 'hour':
      case 'hours':
      case 'h':
        return duration.asHours();
      case 'd':
      case 'D':
      case 'day':
      case 'days':
        return duration.asDays();
      case 'M':
      case 'month':
      case 'months':
        return duration.asMonths();
      case 'y':
      case 'year':
      case 'years':
        return duration.asYears();
      case 'w':
      case 'week':
      case 'weeks':
        return duration.asWeeks();
    }
  }

  /**
   * Returns the difference in milliseconds between the two given dates.
   */
  public static calculateDifferenceBetweenDates(firstDate: Date, secondDate: Date): number {
    return DayjsUtils.calculateDifferenceBetweenDates(firstDate, secondDate);
  }
}
