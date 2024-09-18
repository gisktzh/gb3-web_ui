import {Injectable} from '@angular/core';
import {TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
import {Duration} from 'dayjs/plugin/duration';
import {TimeExtentUtils} from '../../shared/utils/time-extent.utils';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {InvalidTimeSliderConfiguration} from '../../shared/errors/map.errors';
import {DayjsUtils} from '../../shared/utils/dayjs.utils';

@Injectable({
  providedIn: 'root',
})
export class TimeSliderService {
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
      timeExtent.end = TimeExtentUtils.addDuration(timeExtent.start, range);
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

      const startEndDiff: number = TimeExtentUtils.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end);
      const minimalRange: Duration = DayjsUtils.getDuration(timeSliderConfig.minimalRange);

      if (startEndDiff < minimalRange.asMilliseconds()) {
        if (hasStartDateChanged) {
          const newStartDate = TimeExtentUtils.subtractDuration(timeExtent.end, minimalRange);
          timeExtent.start = this.validateDateWithinLimits(newStartDate, minimumDate, maximumDate);
          if (TimeExtentUtils.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end) < minimalRange.asMilliseconds()) {
            timeExtent.end = TimeExtentUtils.addDuration(timeExtent.start, minimalRange);
          }
        } else {
          const newEndDate = TimeExtentUtils.addDuration(timeExtent.start, minimalRange);
          timeExtent.end = this.validateDateWithinLimits(newEndDate, minimumDate, maximumDate);
          if (TimeExtentUtils.calculateDifferenceBetweenDates(timeExtent.start, timeExtent.end) < minimalRange.asMilliseconds()) {
            timeExtent.start = TimeExtentUtils.subtractDuration(timeExtent.end, minimalRange);
          }
        }
      }
    }

    return timeExtent;
  }

  public isTimeExtentValid(timeSliderConfig: TimeSliderConfiguration, timeExtent: TimeExtent): boolean {
    const minDate = DayjsUtils.parseUTCDate(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maxDate = DayjsUtils.parseUTCDate(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);

    const updatedTimeExtent: TimeExtent = this.createValidTimeExtent(timeSliderConfig, timeExtent, false, minDate, maxDate);

    return timeExtent.start.getTime() === updatedTimeExtent.start.getTime() && timeExtent.end.getTime() === updatedTimeExtent.end.getTime();
  }

  /**
   * Creates stops for a layer source containing multiple dates which may not necessarily have constant gaps between them.
   */
  private createStopsForLayerSource(timeSliderConfig: TimeSliderConfiguration): Array<Date> {
    const timeSliderLayerSource = timeSliderConfig.source as TimeSliderLayerSource;
    return timeSliderLayerSource.layers.map((layer) => DayjsUtils.parseUTCDate(layer.date, timeSliderConfig.dateFormat));
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
    const minimumDate: Date = DayjsUtils.parseUTCDate(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat);
    const maximumDate: Date = DayjsUtils.parseUTCDate(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat);
    const initialRange: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    let stopRangeDuration: Duration | null = initialRange ? DayjsUtils.getDuration(initialRange) : null;
    if (
      stopRangeDuration &&
      TimeExtentUtils.calculateDifferenceBetweenDates(minimumDate, maximumDate) <= stopRangeDuration.asMilliseconds()
    ) {
      throw new InvalidTimeSliderConfiguration('min date + range > max date');
    }
    if (!stopRangeDuration) {
      const unit = TimeExtentUtils.extractSmallestUnitFromDateFormat(timeSliderConfig.dateFormat);
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
      date = TimeExtentUtils.addDuration(date, stopRangeDuration);
    }
    dates.push(maximumDate);
    return dates;
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
