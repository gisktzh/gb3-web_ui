import {Injectable} from '@angular/core';
import {TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
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
import {EsriTimeSliderMode} from '../../shared/external/esri.module';

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

  constructor() {
    // TODO WES: remove
    this.timeSliderExtentChanged.subscribe((t) => console.log(`${dayjs(t.start).format('MM.YYYY')} - ${dayjs(t.end).format('MM.YYYY')}`));
  }

  public assignTimeSliderWidget(activeMapItem: ActiveMapItem, container: HTMLDivElement) {
    if (!activeMapItem.timeSliderConfiguration) {
      throw Error('No valid timeslider config available!'); // TODO Error handling
    }

    const timeSliderConfig = activeMapItem.timeSliderConfiguration;
    if (!activeMapItem.timeSliderExtent) {
      activeMapItem.timeSliderExtent = ActiveMapItem.createInitialTimeExtent(timeSliderConfig);
    }

    // TODO WES: remove
    // timeSliderConfig = structuredClone(timeSliderConfig);
    // timeSliderConfig.range = timeSliderConfig.minimalRange;
    // timeSliderConfig.minimalRange = undefined;
    // timeSliderConfig.alwaysMaxRange = true;
    console.log(`minDate: ${timeSliderConfig.minimumDate}, maxDate: ${timeSliderConfig.maximumDate}`);

    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const mode: EsriTimeSliderMode = !timeSliderConfig.alwaysMaxRange && timeSliderConfig.range ? 'instant' : 'time-window';
    const timeExtent = this.transformToEsriTimeExtent(activeMapItem.timeSliderExtent, timeSliderConfig);
    const stops = this.createStops(timeSliderConfig);

    const timeSlider = new TimeSlider({
      container: container,
      mode: mode,
      fullTimeExtent: {
        // entire extent of the timeSlider
        start: minimumDate,
        end: maximumDate
      },
      timeExtent: timeExtent,
      stops: stops
      // TODO WES: remove
      // tickConfigs: [{
      //   mode: "position",
      //   values: [
      //     new Date(2010, 0, 1), new Date(2012, 0, 1), new Date(2014, 0, 1),
      //     new Date(2016, 0, 1), new Date(2018, 0, 1), new Date(2020, 0, 1)
      //   ].map((date) => date.getTime()),
      //   labelsVisible: true,
      //   labelFormatFunction: (value) => {
      //     const date = new Date(value);
      //     return `'${date.getUTCFullYear() - 2000}`;
      //   },
      //   tickCreatedFunction: (value, tickElement, labelElement) => {
      //     tickElement.classList.add("custom-ticks");
      //     labelElement?.classList.add("custom-labels");
      //   }
      // }]
    } as __esri.TimeSliderProperties);

    reactiveUtils.watch(
      () => timeSlider.timeExtent,
      (newValue: __esri.TimeExtent | undefined, oldValue: __esri.TimeExtent | undefined) =>
        this.onTimeExtentChanged(newValue, oldValue, timeSlider, timeSliderConfig)
    );

    // emit initial value
    this.timeSliderExtentChanged$.next(activeMapItem.timeSliderExtent);
  }

  private createStops(timeSliderConfig: TimeSliderConfiguration): __esri.StopsByInterval | __esri.StopsByDates | undefined {
    switch (timeSliderConfig.sourceType) {
      case 'parameter':
        return this.createStopsForParameterSource(timeSliderConfig);
      case 'layer':
        return this.createStopsForLayerSource(timeSliderConfig);
    }
  }

  private createStopsForLayerSource(timeSliderConfig: TimeSliderConfiguration): __esri.StopsByDates {
    const timeSliderLayerSource = timeSliderConfig.source as TimeSliderLayerSource;
    const dates = timeSliderLayerSource.layers.map((l) => dayjs(l.date, timeSliderConfig.dateFormat).toDate());
    return {
      dates: dates
    } as __esri.StopsByDates;
  }

  private createStopsForParameterSource(
    timeSliderConfig: TimeSliderConfiguration
  ): __esri.StopsByDates | __esri.StopsByInterval | undefined {
    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const initialRange: string | null = timeSliderConfig.range ?? timeSliderConfig.minimalRange ?? null;
    const initialRangeDuration: Duration | null = initialRange ? dayjs.duration(initialRange) : null;
    if (initialRangeDuration && Math.abs(dayjs(minimumDate).diff(maximumDate)) <= initialRangeDuration.asMilliseconds()) {
      throw Error(`Invalid time slider configuration: min date + range > max date`); // TODO: error handling
    }

    if (!initialRangeDuration) {
      return undefined;
    }

    // try to return as interval (cleanest solution) - this only works if the given interval is either only years, months or days.
    if (initialRangeDuration.years() === initialRangeDuration.asYears()) {
      return {
        interval: {
          unit: 'years',
          value: initialRangeDuration.years()
        }
      } as __esri.StopsByInterval;
    }
    if (initialRangeDuration.months() === initialRangeDuration.asMonths()) {
      return {
        interval: {
          unit: 'months',
          value: initialRangeDuration.months()
        }
      } as __esri.StopsByInterval;
    }
    if (initialRangeDuration.days() === initialRangeDuration.asDays()) {
      return {
        interval: {
          unit: 'days',
          value: initialRangeDuration.days()
        }
      } as __esri.StopsByInterval;
    }

    // interval was not possible - use a more generic solution instead
    const dates: Date[] = [];
    let date = minimumDate;
    while (date < maximumDate) {
      dates.push(date);
      date = dayjs(date).add(initialRangeDuration).toDate();
    }
    dates.push(maximumDate);
    return {
      dates: dates
    } as __esri.StopsByDates;
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

    const calculateTimeExtent = this.calculateTimeExtent(timeSliderConfig, newValue, oldValue);
    if (calculateTimeExtent) {
      if (Math.abs(dayjs(calculateTimeExtent.start).diff(newValue.start)) > 0) {
        timeSlider.timeExtent.start = calculateTimeExtent.start;
      }
      if (!timeSliderConfig.range && Math.abs(dayjs(calculateTimeExtent.end).diff(newValue.end)) > 0) {
        // don't change the end date if it has a fixed range due to internal logic differences:
        // - Esri Timeslider expects: start === end
        // - Our implementation expects: start === (end - fixed range)
        timeSlider.timeExtent.end = calculateTimeExtent.end;
      }

      if (
        !oldValue ||
        Math.abs(dayjs(oldValue.start).diff(calculateTimeExtent.start)) > 0 ||
        Math.abs(dayjs(oldValue.end).diff(calculateTimeExtent.end)) > 0
      ) {
        console.log(
          `FILTER: new value ${dayjs(calculateTimeExtent.start).format('YYYY')}-${dayjs(calculateTimeExtent.end).format('YYYY')}`
        );
        this.timeSliderExtentChanged$.next(calculateTimeExtent);
      }
    }
  }

  private calculateTimeExtent(
    timeSliderConfig: TimeSliderConfiguration,
    newValue?: __esri.TimeExtent,
    oldValue?: __esri.TimeExtent
  ): TimeSliderExtent | undefined {
    if (!newValue || !oldValue) {
      /*
          No new value: don't change anything
        */
      return undefined;
    }

    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const timeExtent: TimeSliderExtent = {start: newValue.start, end: newValue.end};

    if (timeSliderConfig.alwaysMaxRange) {
      /*
          Always max range:
            start/end date are always min/max
        */
      timeExtent.start = minimumDate;
      timeExtent.end = maximumDate;
      return timeExtent;
    }

    if (timeSliderConfig.range) {
      /*
          Fixed range
            The start has changed as fixed ranges technically don't have an end date
            1. ensure that the changed date is still within the valid minimum range: startDate <= maxDate
            2. the end date has to be adjusted accordingly to enforce the fixed range between start and end date
         */
      const rangeDuration: Duration = dayjs.duration(timeSliderConfig.range);
      timeExtent.start = timeExtent.start <= maximumDate ? timeExtent.start : maximumDate;
      timeExtent.end = dayjs(timeExtent.start).add(rangeDuration).toDate();
      return timeExtent;
    }

    if (timeSliderConfig.minimalRange) {
      /*
          Minimal range
            Either the start or end date has changed;
            1. ensure that the changed date is still within the valid minimum range:
              a. in case the start date was changed: startDate <= maxDate - range
              b. in case the end date was changed:     endDate >= minDate + range
            2. if the difference between the new start and end date is under the given minimum range then
               adjust the value of the previously unchanged value accordingly to enforce the minimal range between them
         */
      const hasStartDateChanged: boolean = Math.abs(dayjs(newValue.start).diff(oldValue.start)) > 0;
      const rangeDuration: Duration = dayjs.duration(timeSliderConfig.minimalRange);
      const maximumRangeStartDate: Date = rangeDuration ? dayjs(maximumDate).subtract(rangeDuration).toDate() : maximumDate;
      const minimumRangeEndDate: Date = rangeDuration ? dayjs(minimumDate).add(rangeDuration).toDate() : minimumDate;
      const startEndDiff: number = Math.abs(dayjs(timeExtent.start).diff(timeExtent.end));

      if (hasStartDateChanged && startEndDiff < rangeDuration.asMilliseconds()) {
        timeExtent.start = timeExtent.start <= maximumRangeStartDate ? timeExtent.start : maximumRangeStartDate;
        timeExtent.end = dayjs(timeExtent.start).add(rangeDuration).toDate();
      } else if (!hasStartDateChanged && startEndDiff < rangeDuration.asMilliseconds()) {
        timeExtent.end = timeExtent.end >= minimumRangeEndDate ? timeExtent.end : minimumRangeEndDate;
        timeExtent.start = dayjs(timeExtent.end).subtract(rangeDuration).toDate();
      }
      return timeExtent;
    }

    return timeExtent;
  }

  private transformToEsriTimeExtent(timeExtent: TimeSliderExtent, timeSliderConfig: TimeSliderConfiguration): __esri.TimeExtent {
    const esriTimeExtent = new TimeExtent({start: timeExtent.start, end: timeExtent.end});
    if (timeSliderConfig.range) {
      // if a range is given then the end date should be the same as the end date
      esriTimeExtent.end = esriTimeExtent.start;
    }
    return esriTimeExtent;
  }
}
