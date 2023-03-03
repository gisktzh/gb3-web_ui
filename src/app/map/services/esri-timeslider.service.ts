import {Injectable} from '@angular/core';
import {TimesliderConfiguration} from '../../shared/interfaces/topic.interface';
import * as moment from 'moment/moment';
import {Duration} from 'moment';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import TimeExtent from '@arcgis/core/TimeExtent';
import {TimesliderService} from '../interfaces/timeslider.service';

@Injectable({
  providedIn: 'root'
})
export class EsriTimesliderService implements TimesliderService {
  constructor() {}

  public assignTimesliderWidget(timesliderConfig: TimesliderConfiguration, container: HTMLDivElement) {
    // TODO WES: remove
    timesliderConfig = structuredClone(timesliderConfig);
    timesliderConfig.range = timesliderConfig.minimalRange;
    timesliderConfig.minimalRange = undefined;
    console.log(`minDate: ${timesliderConfig.minimumDate}, maxDate: ${timesliderConfig.maximumDate}`);

    const minimumDate: Date = moment(timesliderConfig.minimumDate, timesliderConfig.dateFormat).toDate();
    const maximumDate: Date = moment(timesliderConfig.maximumDate, timesliderConfig.dateFormat).toDate();
    const initialRange = timesliderConfig.range ?? timesliderConfig.minimalRange;
    const initialRangeDuration: Duration | null = initialRange ? moment.duration(initialRange) : null;
    if (initialRangeDuration && Math.abs(moment(minimumDate).diff(maximumDate)) <= initialRangeDuration.asMilliseconds()) {
      throw Error(`Invalid time slider configuration: min date + range > max date`); // TODO: error handling
    }

    const initialRangeStartDate: Date = minimumDate;
    const initialRangeEndDate: Date =
      !timesliderConfig.alwaysMaxRange && initialRangeDuration ? moment(minimumDate).add(initialRangeDuration).toDate() : maximumDate;
    const stops = initialRangeDuration ? this.createStopsByIntervalOrDates(initialRangeDuration, minimumDate, maximumDate) : undefined;

    const timeSlider = new TimeSlider({
      container: container,
      mode: 'time-window',
      fullTimeExtent: {
        // entire extent of the timeSlider
        start: minimumDate,
        end: maximumDate
      },
      timeExtent: {
        // location of timeSlider thumbs
        start: initialRangeStartDate,
        end: initialRangeEndDate
      },
      stops: stops
    } as __esri.TimeSliderProperties);

    reactiveUtils.watch(
      () => timeSlider.timeExtent,
      (newValue: __esri.TimeExtent | undefined, oldValue: __esri.TimeExtent | undefined) =>
        this.onTimeExtentChanged(newValue, oldValue, timeSlider, timesliderConfig)
    );
  }

  private createStopsByIntervalOrDates(
    duration: Duration,
    minimumDate: Date,
    maximumDate: Date
  ): __esri.StopsByDates | __esri.StopsByInterval | undefined {
    // try to return as interval (cleanest solution) - this only works if the given duration is either only years, months or days.
    if (duration.years() === duration.asYears()) {
      return {
        interval: {
          unit: 'years',
          value: duration.years()
        }
      } as __esri.StopsByInterval;
    }
    if (duration.months() === duration.asMonths()) {
      return {
        interval: {
          unit: 'months',
          value: duration.months()
        }
      } as __esri.StopsByInterval;
    }
    if (duration.days() === duration.asDays()) {
      return {
        interval: {
          unit: 'days',
          value: duration.days()
        }
      } as __esri.StopsByInterval;
    }

    // interval was not possible - use a more generic solution instead
    const dates: Date[] = [];
    let date = minimumDate;
    while (date <= maximumDate) {
      dates.push(date);
      date = moment(date).add(duration).toDate();
    }
    return {
      dates: dates
    } as __esri.StopsByDates;
  }

  private onTimeExtentChanged(
    newValue: __esri.TimeExtent | undefined,
    oldValue: __esri.TimeExtent | undefined,
    timeSlider: __esri.TimeSlider,
    timesliderConfig: TimesliderConfiguration
  ) {
    if (!newValue) {
      return;
    }

    // TODO WES: remove
    console.log(
      `incoming values: new value ${moment(newValue?.start).format('YYYY')}-${moment(newValue?.end).format('YYYY')}, old value: ${moment(
        oldValue?.start
      ).format('YYYY')}-${moment(oldValue?.end).format('YYYY')}`
    );

    const correctedTimeExtend = new TimeExtent({start: newValue.start, end: newValue.end});
    if (oldValue) {
      const startDateChanged: boolean = Math.abs(moment(newValue.start).diff(oldValue.start)) > 0;
      const minimumDate: Date = moment(timesliderConfig.minimumDate, timesliderConfig.dateFormat).toDate();
      const maximumDate: Date = moment(timesliderConfig.maximumDate, timesliderConfig.dateFormat).toDate();
      const startEndDiff: number = Math.abs(moment(newValue.start).diff(newValue.end));
      const anyRange: string | undefined = timesliderConfig.range ?? timesliderConfig.minimalRange;
      const maximumRangeStartDate: Date = anyRange ? moment(maximumDate).subtract(anyRange).toDate() : maximumDate;
      const minimumRangeEndDate: Date = anyRange ? moment(minimumDate).add(anyRange).toDate() : minimumDate;

      if (timesliderConfig.alwaysMaxRange) {
        /*
          Always max range:
            start/end date are always min/max
        */
        correctedTimeExtend.start = minimumDate;
        correctedTimeExtend.end = maximumDate;
      } else if (timesliderConfig.range) {
        /*
          Fixed range
            Either the start or end date has changed;
            1. ensure that the changed date is still within the valid range:
              a. in case the start date was changed: startDate >= minDate + range
              b. in case the end date was changed:     endDate <= maxDate - range
            2. the previously unchanged value has to be adjusted accordingly to enforce the fixed range between start and end date
         */
        const rangeDuration = moment.duration(timesliderConfig.range);
        if (startDateChanged) {
          correctedTimeExtend.start = newValue.start <= maximumRangeStartDate ? newValue.start : maximumRangeStartDate;
          correctedTimeExtend.end = moment(correctedTimeExtend.start).add(rangeDuration).toDate();
        } else {
          correctedTimeExtend.end = newValue.end >= minimumRangeEndDate ? newValue.end : minimumRangeEndDate;
          correctedTimeExtend.start = moment(correctedTimeExtend.end).subtract(rangeDuration).toDate();
        }
      } else if (timesliderConfig.minimalRange) {
        /*
          Minimal range
            Either the start or end date has changed;
            1. ensure that the changed date is still within the valid minimum range:
              a. in case the start date was changed: startDate >= minDate + range
              b. in case the end date was changed:     endDate <= maxDate - range
            2. if the difference between the new start and end date is under the given minimum range then
               adjust the value of the previously unchanged value accordingly to enforce the minimal range between them
         */
        const minimalRangeDuration = moment.duration(timesliderConfig.minimalRange);
        if (startDateChanged && startEndDiff < minimalRangeDuration.asMilliseconds()) {
          correctedTimeExtend.start = newValue.start <= maximumRangeStartDate ? newValue.start : maximumRangeStartDate;
          correctedTimeExtend.end = moment(correctedTimeExtend.start).add(minimalRangeDuration).toDate();
        } else if (!startDateChanged && startEndDiff < minimalRangeDuration.asMilliseconds()) {
          correctedTimeExtend.end = newValue.end >= minimumRangeEndDate ? newValue.end : minimumRangeEndDate;
          correctedTimeExtend.start = moment(correctedTimeExtend.end).subtract(minimalRangeDuration).toDate();
        }
      }
    }

    if (Math.abs(moment(correctedTimeExtend.start).diff(newValue.start)) > 0) {
      timeSlider.timeExtent.start = correctedTimeExtend.start;
    }
    if (Math.abs(moment(correctedTimeExtend.end).diff(newValue.end)) > 0) {
      timeSlider.timeExtent.end = correctedTimeExtend.end;
    }

    if (!oldValue || Math.abs(moment(oldValue.start).diff(newValue.start)) > 0 || Math.abs(moment(oldValue.end).diff(newValue.end)) > 0) {
      // TODO WES: replace with filters
      console.log(
        `FILTER: new value ${moment(correctedTimeExtend.start).format('YYYY')}-${moment(correctedTimeExtend.end).format('YYYY')}`
      );
    }
  }
}
