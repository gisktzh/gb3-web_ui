import {Injectable, inject} from '@angular/core';
import {MapLayer, TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {InvalidTimeSliderConfiguration} from '../../shared/errors/map.errors';
import {DateUnit} from '../../shared/types/date-unit.type';
import {TIME_SERVICE} from '../../app.tokens';

@Injectable({
  providedIn: 'root',
})
export class TimeSliderService {
  private readonly timeService = inject(TIME_SERVICE);

  /**
   * Creates an initial time extent based on the given time slider configuration.
   */
  public createInitialTimeSliderExtent(timeSliderConfig: TimeSliderConfiguration): TimeExtent {
    const minimumDate: Date = this.timeService.createUTCDateFromString(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maximumDate: Date = this.timeService.createUTCDateFromString(
      this.timeService.replacePlaceholderDates(timeSliderConfig.maximumDate),
      timeSliderConfig.dateFormat,
    );
    return {
      start: minimumDate,
      end: timeSliderConfig.range ? this.timeService.addRangeToDate(minimumDate, timeSliderConfig.range) : maximumDate,
    };
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

  /**
   * Is the given layer visible? Returns `true` or `false` depending on the layer to be within the given time extent; or `undefined` if
   * either the layer isn't part of a time slider configuration, the extent is undefined or the configuration source isn't of type `layer`.
   */
  public isLayerVisible(
    mapLayer: MapLayer,
    timeSliderConfiguration: TimeSliderConfiguration | undefined,
    timeExtent: TimeExtent | undefined,
  ): boolean | undefined {
    if (!timeSliderConfiguration || timeSliderConfiguration.sourceType === 'parameter' || !timeExtent) {
      return undefined;
    }

    const timeSliderLayerSource = timeSliderConfiguration.source as TimeSliderLayerSource;
    const timeSliderLayer = timeSliderLayerSource.layers.find((layer) => layer.layerName === mapLayer.layer);
    if (timeSliderLayer) {
      const date = this.timeService.createUTCDateFromString(timeSliderLayer.date, timeSliderConfiguration.dateFormat);
      return date >= timeExtent.start && date < timeExtent.end;
    } else {
      return undefined;
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
      // Ensure that the new start/end values are within the min/max limits.
      start: this.validateDateWithinLimits(newValue.start, minimumDate, maximumDate),
      end: this.validateDateWithinLimits(newValue.end, minimumDate, maximumDate),
    };

    if (timeSliderConfig.alwaysMaxRange) {
      return this.createMaximumTimeExtent(minimumDate, maximumDate);
    }

    if (timeSliderConfig.range) {
      return this.createFixedTimeExtent(timeExtent, timeSliderConfig.range);
    }

    if (timeSliderConfig.minimalRange) {
      return this.createMinimalTimeExtent(timeExtent, timeSliderConfig.minimalRange, hasStartDateChanged, minimumDate, maximumDate);
    }

    return timeExtent;
  }

  /**
   * Always max range:
   * Start/end dates are always min/max.
   */
  private createMaximumTimeExtent(minimumDate: Date, maximumDate: Date): TimeExtent {
    return {
      start: minimumDate,
      end: maximumDate,
    };
  }

  /**
   * Fixed range:
   * The start date has changed, as fixed ranges technically don't have an end date.
   * Therefore, the end date has to be adjusted accordingly to enforce the fixed range
   * between start and end date.
   */
  private createFixedTimeExtent(timeExtent: TimeExtent, range: string): TimeExtent {
    return {
      ...timeExtent,
      end: this.timeService.addRangeToDate(timeExtent.start, range),
    };
  }

  /**
   * Minimal range:
   * Either the start or end date has changed.
   *
   * 1. Ensure that startDate < endDate.
   * 2. Ensure that the changed date is still within the valid minimum range:
   *    a. In case the start date was changed: minDate <= startDate <= maxDate - range
   *    b. In case the end date was changed:   maxDate >= endDate >= minDate + range
   * 3. If the difference between the new start and end date is under the given
   *    minimum range, adjust the changed value accordingly to enforce the minimal
   *    range between them.
   * 4. If the previous changes are not enough (e.g. in case the min/max limits
   *    have changed), also adjust the previously unchanged value.
   */
  private createMinimalTimeExtent(
    timeExtent: TimeExtent,
    minimalRange: string,
    hasStartDateChanged: boolean,
    minimumDate: Date,
    maximumDate: Date,
  ): TimeExtent {
    this.ensureStartBeforeEnd(timeExtent);

    const minimalRangeInMs = this.timeService.getISORangeInMilliseconds(minimalRange);

    // No adjustment necessary if the minimal range is already satisfied.
    if (this.hasMinimalRange(timeExtent, minimalRangeInMs)) {
      return timeExtent;
    }

    // Adjust the changed date to enforce the minimal range.
    if (hasStartDateChanged) {
      this.adjustStartDate(timeExtent, minimalRange, minimumDate, maximumDate);
    } else {
      this.adjustEndDate(timeExtent, minimalRange, minimumDate, maximumDate);
    }

    return timeExtent;
  }

  /**
   * Ensure that the start date is before the end date.
   * Swap both dates if the start date is later than the end date.
   */
  private ensureStartBeforeEnd(timeExtent: TimeExtent): void {
    if (timeExtent.start > timeExtent.end) {
      [timeExtent.start, timeExtent.end] = [timeExtent.end, timeExtent.start];
    }
  }

  /**
   * Check whether the difference between the start and end dates
   * satisfies the configured minimal range.
   */
  private hasMinimalRange(timeExtent: TimeExtent, minimalRangeInMs: number): boolean {
    return this.timeService.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end) >= minimalRangeInMs;
  }

  /**
   * Start date changed:
   *
   * 1. Calculate the new start date by subtracting the minimal range from the end date.
   * 2. Ensure that the new start date is within the min/max limits.
   * 3. If the minimal range is still not satisfied (e.g. because the minimum date
   *    has changed), adjust the end date as well.
   */
  private adjustStartDate(timeExtent: TimeExtent, minimalRange: string, minimumDate: Date, maximumDate: Date): void {
    const newStartDate = this.timeService.subtractRangeFromDate(timeExtent.end, minimalRange);

    timeExtent.start = this.validateDateWithinLimits(newStartDate, minimumDate, maximumDate);

    const minimalRangeInMs = this.timeService.getISORangeInMilliseconds(minimalRange);

    if (!this.hasMinimalRange(timeExtent, minimalRangeInMs)) {
      timeExtent.end = this.timeService.addRangeToDate(timeExtent.start, minimalRange);
    }
  }

  /**
   * End date changed:
   *
   * 1. Calculate the new end date by adding the minimal range to the start date.
   * 2. Ensure that the new end date is within the min/max limits.
   * 3. If the minimal range is still not satisfied (e.g. because the maximum date
   *    has changed), adjust the start date as well.
   */
  private adjustEndDate(timeExtent: TimeExtent, minimalRange: string, minimumDate: Date, maximumDate: Date): void {
    const newEndDate = this.timeService.addRangeToDate(timeExtent.start, minimalRange);

    timeExtent.end = this.validateDateWithinLimits(newEndDate, minimumDate, maximumDate);

    const minimalRangeInMs = this.timeService.getISORangeInMilliseconds(minimalRange);

    if (!this.hasMinimalRange(timeExtent, minimalRangeInMs)) {
      timeExtent.start = this.timeService.subtractRangeFromDate(timeExtent.end, minimalRange);
    }
  }

  public isTimeExtentValid(timeSliderConfig: TimeSliderConfiguration, timeExtent: TimeExtent): boolean {
    const minDate = this.timeService.createUTCDateFromString(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maxDate = this.timeService.createUTCDateFromString(
      this.timeService.replacePlaceholderDates(timeSliderConfig.maximumDate),
      timeSliderConfig.dateFormat,
    );

    const updatedTimeExtent: TimeExtent = this.createValidTimeExtent(timeSliderConfig, timeExtent, false, minDate, maxDate);

    return timeExtent.start.getTime() === updatedTimeExtent.start.getTime() && timeExtent.end.getTime() === updatedTimeExtent.end.getTime();
  }

  /**
   * Extracts a unit from the given date format (ISO8601) if it contains exactly one or <undefined> if it contains multiple units.
   *
   * @remarks
   * It does return a unit ('years'/'months'/...) only if the given range contains values of this unit and nothing else; <undefined>
   *   otherwise.
   *
   * @example
   * 'YYYY' is a date format containing only years; The unique unit is years and therefore this method returns 'years'
   * 'H:m s.SSS' is a date format containing hours, minutes, seconds and milliseconds; there are multiple units therefore this method
   *   returns 'undefined'
   * */
  public extractUniqueUnitFromDateFormat(dateFormat: string): DateUnit | undefined {
    if (dateFormat.replaceAll('S', '').trim() === '') return 'milliseconds';
    if (dateFormat.replaceAll('s', '').trim() === '') return 'seconds';
    if (dateFormat.replaceAll('m', '').trim() === '') return 'minutes';
    if (dateFormat.replace(/[hH]/g, '').trim() === '') return 'hours';
    if (dateFormat.replace(/[dD]/g, '').trim() === '') return 'days';
    if (dateFormat.replaceAll('M', '').trim() === '') return 'months';
    if (dateFormat.replaceAll('Y', '').trim() === '') return 'years';
    return undefined;
  }

  /**
   * Creates stops for a layer source containing multiple dates which may not necessarily have constant gaps between them.
   */
  private createStopsForLayerSource(timeSliderConfig: TimeSliderConfiguration): Array<Date> {
    const timeSliderLayerSource = timeSliderConfig.source as TimeSliderLayerSource;
    return timeSliderLayerSource.layers.map((layer) => this.timeService.createUTCDateFromString(layer.date, timeSliderConfig.dateFormat));
  }

  /**
   * Creates stops for a parameter source.
   *
   * @remarks
   * This is done by using a strict interval (e.g. one year) if the default range only contains
   * a single type of unit (e.g. 'years'). Otherwise a more generic approach is used by creating date stops from
   * start to finish using the given range; this can lead to gaps near the end but supports all cases.
   */
  private createStopsForParameterSource(timeSliderConfig: TimeSliderConfiguration): Array<Date> {
    const minimumDate: Date = this.timeService.createUTCDateFromString(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maximumDate: Date = this.timeService.createUTCDateFromString(
      this.timeService.replacePlaceholderDates(timeSliderConfig.maximumDate),
      timeSliderConfig.dateFormat,
    );
    const initialRange: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    if (
      initialRange &&
      this.timeService.calculateDifferenceBetweenDates(minimumDate, maximumDate) <= this.timeService.getISORangeInMilliseconds(initialRange)
    ) {
      throw new InvalidTimeSliderConfiguration('min date + range > max date');
    }

    let unit: DateUnit | undefined;
    if (!initialRange) {
      unit = this.extractSmallestUnitFromDateFormat(timeSliderConfig.dateFormat);
      if (!unit) {
        throw new InvalidTimeSliderConfiguration('Datumsformat sowie minimale Range sind ungültig.');
      }
    }

    const dates: Date[] = [];
    let date = minimumDate;
    while (date < maximumDate) {
      dates.push(date);

      if (initialRange) {
        date = this.timeService.addRangeToDate(date, initialRange);
      } else if (unit) {
        date = this.addMinimalRange(date, unit);
      } else {
        throw new InvalidTimeSliderConfiguration('Datumsformat sowie minimale Range sind ungültig.');
      }
    }
    dates.push(maximumDate);
    return dates;
  }

  private addMinimalRange(date: Date, unit: string): Date {
    return this.timeService.addMinimalRangeToDate(date, unit);
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
  private extractSmallestUnitFromDateFormat(dateFormat: string): DateUnit | undefined {
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
}
