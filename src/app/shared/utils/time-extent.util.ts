import {Duration} from 'dayjs/plugin/duration';
import * as dayjs from 'dayjs';
import {ManipulateType} from 'dayjs';
import {TimeSliderConfiguration} from '../interfaces/topic.interface';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';

export class TimeExtentUtil {
  /**
   * Creates an initial time extent based on the given time slider configuration.
   */
  public static createInitialTimeSliderExtent(timeSliderConfig: TimeSliderConfiguration): TimeExtent {
    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const range: Duration | null = timeSliderConfig.range ? dayjs.duration(timeSliderConfig.range) : null;
    return {
      start: minimumDate,
      end: range ? TimeExtentUtil.addDuration(minimumDate, range) : maximumDate
    };
  }

  /**
   * Extracts the unit from the given duration or <undefined> if it contains values with multiple units.
   *
   * @remarks
   * It does return a unit ('years'/'months'/...) only if the given duration contains values of this unit and nothing else; <undefined> otherwise.
   *
   * @example
   * 'P3Y' is a duration of 3 years. The duration only contains years and therefore this method returns 'years'
   * 'P1Y6M' is a duration of 1 year and 6 months. It contains years (1) and months (6) which is a mix of two units. The return value will be <undefined>.
   * */
  public static extractUnitFromDuration(duration: Duration): ManipulateType | undefined {
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
   * Adds the duration to the given date as exact as possible.
   *
   * @remarks
   * It does more than a simple `dayjs(date).add(duration)`. It will add values of a specific unit to the date in case that
   * the duration contains only values of one specific unit (e.g. 'years'). This has the advantage that it does not use
   * a generic solution which would be 365 days in case of a year.
   *
   * @example
   * addDuration(01.01.2000, duration(1, 'years')) === 01.01.2001
   * while the default way using `dayjs.add` would lead to an error: dayjs(01.01.2000).add(duration(1, 'years')) === 01.01.2000 + 365 days === 31.12.2000
   * */
  public static addDuration(date: Date, duration: Duration): Date {
    const unit = TimeExtentUtil.extractUnitFromDuration(duration);
    if (!unit) {
      return dayjs(date).add(duration).toDate();
    }
    const value = TimeExtentUtil.getDurationAsNumber(duration, unit);
    return dayjs(date).add(value, unit).toDate();
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
   * while the default way using `dayjs.subtract` would lead to an error: dayjs(01.01.2001).subtract(duration(1, 'years')) === 01.01.2001 - 365 days === 02.01.2000
   * */
  public static subtractDuration(date: Date, duration: Duration): Date {
    const unit = TimeExtentUtil.extractUnitFromDuration(duration);
    if (!unit) {
      return dayjs(date).subtract(duration).toDate();
    }
    const value = TimeExtentUtil.getDurationAsNumber(duration, unit);
    return dayjs(date).subtract(value, unit).toDate();
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
}
