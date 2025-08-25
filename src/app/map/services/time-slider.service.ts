import {Injectable, inject} from '@angular/core';
import {MapLayer, TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {InvalidTimeSliderConfiguration} from '../../shared/errors/map.errors';
import {TimeService} from '../../shared/interfaces/time-service.interface';
import {DateUnit} from '../../shared/types/date-unit.type';
import {TIME_SERVICE} from '../../app.tokens';

@Injectable({
  providedIn: 'root',
})
export class TimeSliderService {
  private readonly timeService = inject<TimeService>(TIME_SERVICE);

  /**
   * Creates an initial time extent based on the given time slider configuration.
   */
  public createInitialTimeSliderExtent(timeSliderConfig: TimeSliderConfiguration): TimeExtent {
    const minimumDate: Date = this.timeService.createUTCDateFromString(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maximumDate: Date = this.timeService.createUTCDateFromString(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);
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
      timeExtent.end = this.timeService.addRangeToDate(timeExtent.start, timeSliderConfig.range);
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
      const minimalRangeInMs: number = this.timeService.getISORangeInMilliseconds(timeSliderConfig.minimalRange);

      if (startEndDiff < minimalRangeInMs) {
        if (hasStartDateChanged) {
          const newStartDate = this.timeService.subtractRangeFromDate(timeExtent.end, timeSliderConfig.minimalRange);
          timeExtent.start = this.validateDateWithinLimits(newStartDate, minimumDate, maximumDate);
          if (this.timeService.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end) < minimalRangeInMs) {
            timeExtent.end = this.timeService.addRangeToDate(timeExtent.start, timeSliderConfig.minimalRange);
          }
        } else {
          const newEndDate = this.timeService.addRangeToDate(timeExtent.start, timeSliderConfig.minimalRange);
          timeExtent.end = this.validateDateWithinLimits(newEndDate, minimumDate, maximumDate);
          if (this.timeService.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end) < minimalRangeInMs) {
            timeExtent.start = this.timeService.subtractRangeFromDate(timeExtent.end, timeSliderConfig.minimalRange);
          }
        }
      }
    }

    return timeExtent;
  }

  public isTimeExtentValid(timeSliderConfig: TimeSliderConfiguration, timeExtent: TimeExtent): boolean {
    const minDate = this.timeService.createUTCDateFromString(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maxDate = this.timeService.createUTCDateFromString(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);

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
    const maximumDate: Date = this.timeService.createUTCDateFromString(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);
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
