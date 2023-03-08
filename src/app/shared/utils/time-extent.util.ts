import {Duration} from 'dayjs/plugin/duration';
import * as dayjs from 'dayjs';
import {ManipulateType} from 'dayjs';
import {TimeSliderConfiguration} from '../interfaces/topic.interface';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';

export class TimeExtentUtil {
  public static createInitialTimeSliderExtent(timeSliderConfig: TimeSliderConfiguration): TimeExtent {
    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const range: Duration | null = timeSliderConfig.range ? dayjs.duration(timeSliderConfig.range) : null;
    return {
      start: minimumDate,
      end: range ? TimeExtentUtil.addDuration(minimumDate, range) : maximumDate
    };
  }

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

  public static addDuration(date: Date, duration: Duration): Date {
    const unit = TimeExtentUtil.extractUnitFromDuration(duration);
    if (!unit) {
      return dayjs(date).add(duration).toDate();
    }
    const value = TimeExtentUtil.getDurationAsNumber(duration, unit);
    return dayjs(date).add(value, unit).toDate();
  }

  public static substractDuration(date: Date, duration: Duration): Date {
    const unit = TimeExtentUtil.extractUnitFromDuration(duration);
    if (!unit) {
      return dayjs(date).subtract(duration).toDate();
    }
    const value = TimeExtentUtil.getDurationAsNumber(duration, unit);
    return dayjs(date).subtract(value, unit).toDate();
  }

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
