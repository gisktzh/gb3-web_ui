import {Inject, Injectable} from '@angular/core';
import {TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
import {Duration} from 'dayjs/plugin/duration';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {InvalidTimeSliderConfiguration} from '../../shared/errors/map.errors';
import {DayjsUtils} from '../../shared/utils/dayjs.utils';
import {TIME_SERVICE} from '../../app.module';
import {TimeService} from '../../shared/interfaces/time-service.interface';
import {ManipulateType} from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class TimeSliderService {
  constructor(@Inject(TIME_SERVICE) private readonly timeService: TimeService) {}

  /**
   * Creates an initial time extent based on the given time slider configuration.
   */
  public static createInitialTimeSliderExtent(timeSliderConfig: TimeSliderConfiguration): TimeExtent {
    const minimumDate: Date = DayjsUtils.parseUTCDate(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maximumDate: Date = DayjsUtils.parseUTCDate(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);
    const range: Duration | null = timeSliderConfig.range ? DayjsUtils.getDuration(timeSliderConfig.range) : null;
    return {
      start: minimumDate,
      end: range ? this.addDuration(minimumDate, range) : maximumDate,
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
    // todo: this could be a utils class still
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
   * Gets the whole given duration as a number value in the desired unit.
   */
  public static getDurationAsNumber(duration: Duration, unit: ManipulateType): number {
    // todo: this one as well
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
  private static addDuration(date: Date, duration: Duration): Date {
    const unit = TimeSliderService.extractUniqueUnitFromDuration(duration);
    if (!unit) {
      return DayjsUtils.addDuration(date, duration);
    }
    const value = TimeSliderService.getDurationAsNumber(duration, unit);
    return DayjsUtils.addDuration(date, DayjsUtils.getDurationWithUnit(value, unit));
  }

  /**
   * Creates stops which define specific locations on the time slider where thumbs will snap to when manipulated.
   */
  public createStops(timeSliderConfig: TimeSliderConfiguration): Array<Date> {
    switch (timeSliderConfig.sourceType) {
      case 'parameter':
        return this.createStopsForParameterSource(timeSliderConfig);
      case 'layer':
        return this.createStopsForLayerSource(timeSliderConfig);
    }
  }

  public createValidTimeExtent(
    timeSliderConfig: TimeSliderConfiguration,
    newValue: TimeExtent,
    hasStartDateChanged: boolean,
    minimumDate: Date,
    maximumDate: Date,
  ): TimeExtent {
    const timeExtent: TimeExtent = {
      // ensure that the new start/end values are within the min/max limits
      start: this.validateDateWithinLimits(newValue.start, minimumDate, maximumDate),
      end: this.validateDateWithinLimits(newValue.end, minimumDate, maximumDate),
    };

    if (timeSliderConfig.alwaysMaxRange) {
      /*
          Always max range:
            start/end date are always min/max
        */
      timeExtent.start = minimumDate;
      timeExtent.end = maximumDate;
    } else if (timeSliderConfig.range) {
      /*
          Fixed range
            The start has changed as fixed ranges technically don't have an end date
            => the end date has to be adjusted accordingly to enforce the fixed range between start and end date
         */
      const range: Duration = DayjsUtils.getDuration(timeSliderConfig.range);
      timeExtent.end = TimeSliderService.addDuration(timeExtent.start, range);
    } else if (timeSliderConfig.minimalRange) {
      /*
          Minimal range
            Either the start or end date has changed;
            1. Ensure that startDate < endDate.
            2. ensure that the changed date is still within the valid minimum range:
              a. in case the start date was changed: minDate <= startDate <= maxDate - range
              b. in case the end date was changed:   maxDate >= endDate >= minDate + range
            3. if the difference between the new start and end date is under the given minimum range then
               adjust the value of the changed value accordingly to enforce the minimal range between them
            4. if the previous changes are not enough (e.g. in case the min/max limits have changed) then
               also adjust the value of the previously unchanged value.
         */

      if (timeExtent.start > timeExtent.end) {
        const startDate: Date = timeExtent.start;
        timeExtent.start = timeExtent.end;
        timeExtent.end = startDate;
      }

      const startEndDiff: number = this.timeService.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end);
      const minimalRange: Duration = DayjsUtils.getDuration(timeSliderConfig.minimalRange);

      if (startEndDiff < minimalRange.asMilliseconds()) {
        if (hasStartDateChanged) {
          const newStartDate = this.subtractDuration(timeExtent.end, minimalRange);
          timeExtent.start = this.validateDateWithinLimits(newStartDate, minimumDate, maximumDate);
          if (this.timeService.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end) < minimalRange.asMilliseconds()) {
            timeExtent.end = TimeSliderService.addDuration(timeExtent.start, minimalRange);
          }
        } else {
          const newEndDate = TimeSliderService.addDuration(timeExtent.start, minimalRange);
          timeExtent.end = this.validateDateWithinLimits(newEndDate, minimumDate, maximumDate);
          if (this.timeService.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end) < minimalRange.asMilliseconds()) {
            timeExtent.start = this.subtractDuration(timeExtent.end, minimalRange);
          }
        }
      }
    }

    return timeExtent;
  }

  public isTimeExtentValid(timeSliderConfig: TimeSliderConfiguration, timeExtent: TimeExtent): boolean {
    const minDate = this.timeService.getUTCDateFromString(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maxDate = this.timeService.getUTCDateFromString(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);

    const updatedTimeExtent: TimeExtent = this.createValidTimeExtent(timeSliderConfig, timeExtent, false, minDate, maxDate);

    return timeExtent.start.getTime() === updatedTimeExtent.start.getTime() && timeExtent.end.getTime() === updatedTimeExtent.end.getTime();
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
  public extractUniqueUnitFromDateFormat(dateFormat: string): ManipulateType | undefined {
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
   * Creates stops for a layer source containing multiple dates which may not necessarily have constant gaps between them.
   */
  private createStopsForLayerSource(timeSliderConfig: TimeSliderConfiguration): Array<Date> {
    const timeSliderLayerSource = timeSliderConfig.source as TimeSliderLayerSource;
    return timeSliderLayerSource.layers.map((layer) => this.timeService.getUTCDateFromString(layer.date, timeSliderConfig.dateFormat));
  }

  /**
   * Creates stops for a parameter source.
   *
   * @remarks
   * This is done by using a strict interval (e.g. one year) if the default range duration only contains
   * a single type of unit (e.g. 'years'). Otherwise a more generic approach is used by creating date stops from
   * start to finish using the given duration; this can lead to gaps near the end but supports all cases.
   */
  private createStopsForParameterSource(timeSliderConfig: TimeSliderConfiguration): Array<Date> {
    const minimumDate: Date = this.timeService.getUTCDateFromString(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maximumDate: Date = this.timeService.getUTCDateFromString(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);
    const initialRange: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    let stopRangeDuration: Duration | null = initialRange ? DayjsUtils.getDuration(initialRange) : null;
    if (
      stopRangeDuration &&
      this.timeService.calculateDifferenceBetweenDates(minimumDate, maximumDate) <= stopRangeDuration.asMilliseconds()
    ) {
      throw new InvalidTimeSliderConfiguration('min date + range > max date');
    }
    if (!stopRangeDuration) {
      const unit = this.extractSmallestUnitFromDateFormat(timeSliderConfig.dateFormat);
      if (!unit) {
        throw new InvalidTimeSliderConfiguration('Datumsformat sowie minimale Range sind ungültig.');
      }

      // create a new duration base on the smallest unit with the lowest valid unit number (1)
      stopRangeDuration = DayjsUtils.getDurationWithUnit(1, unit);
    }

    const dates: Date[] = [];
    let date = minimumDate;
    while (date < maximumDate) {
      dates.push(date);
      date = TimeSliderService.addDuration(date, stopRangeDuration);
    }
    dates.push(maximumDate);
    return dates;
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
  private extractSmallestUnitFromDateFormat(dateFormat: string): ManipulateType | undefined {
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
   * Validates that the date is within the given min and max date; returns the date if it is within or the corresponding min/max date
   * otherwise.
   */
  private validateDateWithinLimits(date: Date, minimumDate: Date, maximumDate: Date): Date {
    let validDate = date;
    if (date < minimumDate) {
      validDate = minimumDate;
    } else if (date > maximumDate) {
      validDate = maximumDate;
    }
    return validDate;
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
  private subtractDuration(date: Date, duration: Duration): Date {
    const unit = TimeSliderService.extractUniqueUnitFromDuration(duration);
    if (!unit) {
      return DayjsUtils.subtractDuration(date, duration);
    }
    const value = TimeSliderService.getDurationAsNumber(duration, unit);
    return DayjsUtils.subtractDuration(date, DayjsUtils.getDurationWithUnit(value, unit));
  }
}
