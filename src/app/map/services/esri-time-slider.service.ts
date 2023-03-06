import {Injectable} from '@angular/core';
import {TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import TimeExtent from '@arcgis/core/TimeExtent';
import {TimeSliderService} from '../interfaces/time-slider.service';
import {debounceTime, Observable, ReplaySubject} from 'rxjs';
import {TimeSliderExtent} from '../interfaces/time-slider-extent.interface';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import {Duration} from 'dayjs/plugin/duration';
import {ActiveMapItem} from '../models/active-map-item.model';

dayjs.extend(duration);

@Injectable({
  providedIn: 'root'
})
export class EsriTimeSliderService implements TimeSliderService {
  private readonly timeSliderExtentChanged$: ReplaySubject<TimeSliderExtent> = new ReplaySubject<TimeSliderExtent>(1);
  public readonly timeSliderExtentChanged: Observable<TimeSliderExtent> = this.timeSliderExtentChanged$
    .asObservable()
    // add a debounce time as every step of the time slider creates a change of state which then creates a request to the server
    .pipe(debounceTime(200));

  public assignTimeSliderWidget(activeMapItem: ActiveMapItem, container: HTMLDivElement) {
    if (!activeMapItem.timeSliderConfiguration) {
      throw Error('No valid timeslider config available!'); // TODO Error handling
    }

    const timeSliderConfig = activeMapItem.timeSliderConfiguration;

    // TODO WES: remove
    // timeSliderConfig = structuredClone(timeSliderConfig);
    // timeSliderConfig.range = timeSliderConfig.minimalRange;
    // timeSliderConfig.minimalRange = undefined;
    // timeSliderConfig.alwaysMaxRange = true;
    console.log(`minDate: ${timeSliderConfig.minimumDate}, maxDate: ${timeSliderConfig.maximumDate}`);

    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const initialRange: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    const initialRangeDuration: Duration | null = initialRange ? dayjs.duration(initialRange) : null;
    if (initialRangeDuration && Math.abs(dayjs(minimumDate).diff(maximumDate)) <= initialRangeDuration.asMilliseconds()) {
      throw Error(`Invalid time slider configuration: min date + range > max date`); // TODO: error handling
    }
    const initialTimeExtent = activeMapItem.timeSliderExtent ?? ActiveMapItem.createInitialTimeExtent(timeSliderConfig);

    const stops = initialRangeDuration ? this.createStopsByIntervalOrDates(initialRangeDuration, minimumDate, maximumDate) : undefined;

    const timeSlider = new TimeSlider({
      container: container,
      mode: 'time-window',
      fullTimeExtent: {
        // entire extent of the timeSlider
        start: minimumDate,
        end: maximumDate
      },
      timeExtent: {start: initialTimeExtent.start, end: initialTimeExtent.end},
      stops: stops
    } as __esri.TimeSliderProperties);

    reactiveUtils.watch(
      () => timeSlider.timeExtent,
      (newValue: __esri.TimeExtent | undefined, oldValue: __esri.TimeExtent | undefined) =>
        this.onTimeExtentChanged(newValue, oldValue, timeSlider, timeSliderConfig)
    );

    // emit initial value
    this.timeSliderExtentChanged$.next(initialTimeExtent);
  }

  private createStopsByIntervalOrDates(
    interval: Duration,
    minimumDate: Date,
    maximumDate: Date
  ): __esri.StopsByDates | __esri.StopsByInterval | undefined {
    // TODO WES: add support for layer source type

    // try to return as interval (cleanest solution) - this only works if the given interval is either only years, months or days.
    if (interval.years() === interval.asYears()) {
      return {
        interval: {
          unit: 'years',
          value: interval.years()
        }
      } as __esri.StopsByInterval;
    }
    if (interval.months() === interval.asMonths()) {
      return {
        interval: {
          unit: 'months',
          value: interval.months()
        }
      } as __esri.StopsByInterval;
    }
    if (interval.days() === interval.asDays()) {
      return {
        interval: {
          unit: 'days',
          value: interval.days()
        }
      } as __esri.StopsByInterval;
    }

    // TODO WES enddate?
    // interval was not possible - use a more generic solution instead
    const dates: Date[] = [];
    let date = minimumDate;
    while (date <= maximumDate) {
      dates.push(date);
      date = dayjs(date).add(interval).toDate();
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
    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const range: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    const rangeDuration: Duration | null = range ? dayjs.duration(range) : null;

    if (!newValue) {
      /*
          No new value: return initial extent
        */
      const initialStartDate: Date = minimumDate;
      const initialEndDate: Date =
        !timeSliderConfig.alwaysMaxRange && rangeDuration ? dayjs(minimumDate).add(rangeDuration).toDate() : maximumDate;
      return new TimeExtent({start: initialStartDate, end: initialEndDate});
    }

    const timeExtent = new TimeExtent({start: newValue.start, end: newValue.end});
    if (!oldValue) {
      /*
          No old value: there was no change - just return the new values
        */
      return timeExtent;
    }

    const hasStartDateChanged: boolean = Math.abs(dayjs(newValue.start).diff(oldValue.start)) > 0;

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
      const maximumRangeStartDate: Date = rangeDuration ? dayjs(maximumDate).subtract(rangeDuration).toDate() : maximumDate;
      const minimumRangeEndDate: Date = rangeDuration ? dayjs(minimumDate).add(rangeDuration).toDate() : minimumDate;
      const startEndDiff: number = Math.abs(dayjs(timeExtent.start).diff(timeExtent.end));

      if (hasStartDateChanged && (hasFixedRange || startEndDiff < rangeDuration.asMilliseconds())) {
        timeExtent.start = timeExtent.start <= maximumRangeStartDate ? timeExtent.start : maximumRangeStartDate;
        timeExtent.end = dayjs(timeExtent.start).add(rangeDuration).toDate();
      } else if (!hasStartDateChanged && (hasFixedRange || startEndDiff < rangeDuration.asMilliseconds())) {
        timeExtent.end = timeExtent.end >= minimumRangeEndDate ? timeExtent.end : minimumRangeEndDate;
        timeExtent.start = dayjs(timeExtent.end).subtract(rangeDuration).toDate();
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
      `incoming values: new value ${dayjs(newValue?.start).format('YYYY')}-${dayjs(newValue?.end).format('YYYY')}, old value: ${dayjs(
        oldValue?.start
      ).format('YYYY')}-${dayjs(oldValue?.end).format('YYYY')}`
    );

    const correctedTimeExtend = this.calculateTimeExtent(timeSliderConfig, newValue, oldValue);
    if (Math.abs(dayjs(correctedTimeExtend.start).diff(newValue.start)) > 0) {
      timeSlider.timeExtent.start = correctedTimeExtend.start;
    }
    if (Math.abs(dayjs(correctedTimeExtend.end).diff(newValue.end)) > 0) {
      timeSlider.timeExtent.end = correctedTimeExtend.end;
    }

    if (!oldValue || Math.abs(dayjs(oldValue.start).diff(newValue.start)) > 0 || Math.abs(dayjs(oldValue.end).diff(newValue.end)) > 0) {
      console.log(`FILTER: new value ${dayjs(correctedTimeExtend.start).format('YYYY')}-${dayjs(correctedTimeExtend.end).format('YYYY')}`);
      const timeSliderExtent = this.convertEsriTimeExtent(correctedTimeExtend, timeSliderConfig.dateFormat);
      this.timeSliderExtentChanged$.next(timeSliderExtent);
    }
  }

  private convertEsriTimeExtent(esriTimeExtent: __esri.TimeExtent, dateFormat: string): TimeSliderExtent {
    return {
      start: esriTimeExtent.start,
      startAsString: dayjs(esriTimeExtent.start).format(dateFormat),
      end: esriTimeExtent.end,
      endAsString: dayjs(esriTimeExtent.end).format(dateFormat)
    } as TimeSliderExtent;
  }
}
