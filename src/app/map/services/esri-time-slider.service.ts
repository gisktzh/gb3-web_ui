import {Injectable} from '@angular/core';
import {TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import * as moment from 'moment/moment';
import {Duration} from 'moment';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import TimeExtent from '@arcgis/core/TimeExtent';
import {TimeSliderService} from '../interfaces/time-slider.service';
import {Observable, ReplaySubject} from 'rxjs';
import {TimeSliderExtent} from '../interfaces/time-slider-extent.interface';

@Injectable({
  providedIn: 'root'
})
export class EsriTimeSliderService implements TimeSliderService {
  private readonly timeSliderExtentChanged$: ReplaySubject<TimeSliderExtent> = new ReplaySubject<TimeSliderExtent>(1);
  public readonly timeSliderExtentChanged: Observable<TimeSliderExtent> = this.timeSliderExtentChanged$.asObservable();

  public assignTimeSliderWidget(timeSliderConfig: TimeSliderConfiguration, container: HTMLDivElement) {
    // TODO WES: remove
    // timeSliderConfig = structuredClone(timeSliderConfig);
    // timeSliderConfig.range = timeSliderConfig.minimalRange;
    // timeSliderConfig.minimalRange = undefined;
    // timeSliderConfig.alwaysMaxRange = true;
    console.log(`minDate: ${timeSliderConfig.minimumDate}, maxDate: ${timeSliderConfig.maximumDate}`);

    const minimumDate: Date = moment(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = moment(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const initialRange: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    const initialRangeDuration: Duration | null = initialRange ? moment.duration(initialRange) : null;
    if (initialRangeDuration && Math.abs(moment(minimumDate).diff(maximumDate)) <= initialRangeDuration.asMilliseconds()) {
      throw Error(`Invalid time slider configuration: min date + range > max date`); // TODO: error handling
    }
    const initialTimeExtent = this.calculateTimeExtent(timeSliderConfig);

    const stops = initialRangeDuration ? this.createStopsByIntervalOrDates(initialRangeDuration, minimumDate, maximumDate) : undefined;

    const timeSlider = new TimeSlider({
      container: container,
      mode: 'time-window',
      fullTimeExtent: {
        // entire extent of the timeSlider
        start: minimumDate,
        end: maximumDate
      },
      timeExtent: initialTimeExtent,
      stops: stops
    } as __esri.TimeSliderProperties);

    reactiveUtils.watch(
      () => timeSlider.timeExtent,
      (newValue: __esri.TimeExtent | undefined, oldValue: __esri.TimeExtent | undefined) =>
        this.onTimeExtentChanged(newValue, oldValue, timeSlider, timeSliderConfig)
    );

    // emit initial value
    const timeSliderExtent = this.convertEsriTimeExtent(initialTimeExtent, timeSliderConfig.dateFormat);
    this.timeSliderExtentChanged$.next(timeSliderExtent);
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

  private calculateTimeExtent(
    timeSliderConfig: TimeSliderConfiguration,
    newValue?: __esri.TimeExtent,
    oldValue?: __esri.TimeExtent
  ): __esri.TimeExtent {
    const minimumDate: Date = moment(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = moment(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const range: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    const rangeDuration: Duration | null = range ? moment.duration(range) : null;

    if (!newValue) {
      /*
          No new value: return initial extent
        */
      const initialStartDate: Date = minimumDate;
      const initialEndDate: Date =
        !timeSliderConfig.alwaysMaxRange && rangeDuration ? moment(minimumDate).add(rangeDuration).toDate() : maximumDate;
      return new TimeExtent({start: initialStartDate, end: initialEndDate});
    }

    const timeExtent = new TimeExtent({start: newValue.start, end: newValue.end});
    if (!oldValue) {
      /*
          No old value: there was no change - just return the new values
        */
      return timeExtent;
    }

    const hasStartDateChanged: boolean = Math.abs(moment(newValue.start).diff(oldValue.start)) > 0;

    if (timeSliderConfig.alwaysMaxRange) {
      /*
          Always max range:
            start/end date are always min/max
        */
      timeExtent.start = minimumDate;
      timeExtent.end = maximumDate;
      return timeExtent;
    }

    if (rangeDuration) {
      /*
          Minimal or fixed range
            Either the start or end date has changed;
            1. ensure that the changed date is still within the valid minimum range:
              a. in case the start date was changed: startDate <= maxDate - range
              b. in case the end date was changed:     endDate >= minDate + range
            2. depending on whether it is a minimal or fixed range requirement do:
              a. fixed range
                 the previously unchanged value has to be adjusted accordingly to enforce the fixed range between start and end date
              b. minimal range
                 if the difference between the new start and end date is under the given minimum range then
                 adjust the value of the previously unchanged value accordingly to enforce the minimal range between them
         */
      const hasFixedRange = !!timeSliderConfig.range;
      const maximumRangeStartDate: Date = rangeDuration ? moment(maximumDate).subtract(rangeDuration).toDate() : maximumDate;
      const minimumRangeEndDate: Date = rangeDuration ? moment(minimumDate).add(rangeDuration).toDate() : minimumDate;
      const startEndDiff: number = Math.abs(moment(timeExtent.start).diff(timeExtent.end));

      if (hasStartDateChanged && (hasFixedRange || startEndDiff < rangeDuration.asMilliseconds())) {
        timeExtent.start = timeExtent.start <= maximumRangeStartDate ? timeExtent.start : maximumRangeStartDate;
        timeExtent.end = moment(timeExtent.start).add(rangeDuration).toDate();
      } else if (!hasStartDateChanged && (hasFixedRange || startEndDiff < rangeDuration.asMilliseconds())) {
        timeExtent.end = timeExtent.end >= minimumRangeEndDate ? timeExtent.end : minimumRangeEndDate;
        timeExtent.start = moment(timeExtent.end).subtract(rangeDuration).toDate();
      }
    }

    return timeExtent;
  }

  private onTimeExtentChanged(
    newValue: __esri.TimeExtent | undefined,
    oldValue: __esri.TimeExtent | undefined,
    timeSlider: __esri.TimeSlider,
    timeSliderConfig: TimeSliderConfiguration
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

    const correctedTimeExtend = this.calculateTimeExtent(timeSliderConfig, newValue, oldValue);
    if (Math.abs(moment(correctedTimeExtend.start).diff(newValue.start)) > 0) {
      timeSlider.timeExtent.start = correctedTimeExtend.start;
    }
    if (Math.abs(moment(correctedTimeExtend.end).diff(newValue.end)) > 0) {
      timeSlider.timeExtent.end = correctedTimeExtend.end;
    }

    if (!oldValue || Math.abs(moment(oldValue.start).diff(newValue.start)) > 0 || Math.abs(moment(oldValue.end).diff(newValue.end)) > 0) {
      console.log(
        `FILTER: new value ${moment(correctedTimeExtend.start).format('YYYY')}-${moment(correctedTimeExtend.end).format('YYYY')}`
      );
      const timeSliderExtent = this.convertEsriTimeExtent(correctedTimeExtend, timeSliderConfig.dateFormat);
      this.timeSliderExtentChanged$.next(timeSliderExtent);
    }
  }

  private convertEsriTimeExtent(esriTimeExtent: __esri.TimeExtent, dateFormat: string): TimeSliderExtent {
    return {
      start: esriTimeExtent.start,
      startAsString: moment(esriTimeExtent.start).format(dateFormat),
      end: esriTimeExtent.end,
      endAsString: moment(esriTimeExtent.end).format(dateFormat)
    } as TimeSliderExtent;
  }
}
