import {Injectable} from '@angular/core';
import {TimeSliderConfiguration, TimeSliderLayerSource} from '../../shared/interfaces/topic.interface';
import {TimeSliderService} from '../interfaces/time-slider.service';
import {debounceTime, filter, Observable, Subject} from 'rxjs';
import {TimeExtent} from '../interfaces/time-extent.interface';
import * as dayjs from 'dayjs';
import {ManipulateType} from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import {Duration} from 'dayjs/plugin/duration';
import {ActiveMapItem} from '../models/active-map-item.model';
import {esriReactiveUtils, EsriTimeExtent, EsriTimeIntervalUnit, EsriTimeSlider, EsriTimeSliderMode} from '../external/esri.module';
import {TimeExtentUtil} from '../../shared/utils/time-extent.util';
import {map} from 'rxjs/operators';

dayjs.extend(duration);

@Injectable({
  providedIn: 'root'
})
export class EsriTimeSliderService implements TimeSliderService {
  private readonly timeExtentChanged$: Subject<{activeMapItemId: string; timeExtent: TimeExtent}> = new Subject<{
    activeMapItemId: string;
    timeExtent: TimeExtent;
  }>();

  public assignTimeSliderWidget(activeMapItem: ActiveMapItem, container: HTMLDivElement) {
    if (!activeMapItem.timeSliderConfiguration) {
      throw Error('No valid timeslider config available!'); // TODO Error handling
    }

    const timeSliderConfig = activeMapItem.timeSliderConfiguration;
    if (!activeMapItem.timeSliderExtent) {
      activeMapItem.timeSliderExtent = TimeExtentUtil.createInitialTimeSliderExtent(timeSliderConfig);
    }

    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const mode: EsriTimeSliderMode = !timeSliderConfig.alwaysMaxRange && timeSliderConfig.range ? 'instant' : 'time-window';
    const timeExtent = this.transformToEsriTimeExtent(activeMapItem.timeSliderExtent, timeSliderConfig);
    const stops = this.createStops(timeSliderConfig);

    const timeSlider = new EsriTimeSlider({
      container: container,
      mode: mode,
      fullTimeExtent: {
        // entire extent of the timeSlider
        start: minimumDate,
        end: maximumDate
      },
      timeExtent: timeExtent,
      stops: stops
    } as __esri.TimeSliderProperties);

    esriReactiveUtils.watch(
      () => timeSlider.timeExtent,
      (newValue: __esri.TimeExtent | undefined, oldValue: __esri.TimeExtent | undefined) =>
        this.onTimeExtentChanged(newValue, oldValue, activeMapItem.id, timeSlider, timeSliderConfig)
    );

    // emit initial value
    this.timeExtentChanged$.next({activeMapItemId: activeMapItem.id, timeExtent: activeMapItem.timeSliderExtent});
  }

  public watchTimeExtent(activeMapItemId: string): Observable<TimeExtent> {
    return this.timeExtentChanged$.asObservable().pipe(
      filter((value) => value.activeMapItemId === activeMapItemId),
      // add a debounce time as every step of the time slider creates a change of state which then creates a request to the server
      debounceTime(200),
      map((value) => value.timeExtent)
    );
  }

  public createValidTimeExtent(timeSliderConfig: TimeSliderConfiguration, newValue: TimeExtent, oldValue?: TimeExtent): TimeExtent {
    const minimumDate: Date = dayjs(timeSliderConfig.minimumDate, timeSliderConfig.dateFormat).toDate();
    const maximumDate: Date = dayjs(timeSliderConfig.maximumDate, timeSliderConfig.dateFormat).toDate();
    const timeExtent: TimeExtent = {
      start: newValue.start < minimumDate ? minimumDate : newValue.start,
      end: newValue.end > maximumDate ? maximumDate : newValue.end
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
            1. ensure that the changed date is still within the valid minimum range: minDate <= startDate <= maxDate
            2. the end date has to be adjusted accordingly to enforce the fixed range between start and end date
         */
      const range: Duration = dayjs.duration(timeSliderConfig.range);
      timeExtent.start = timeExtent.start > maximumDate ? maximumDate : timeExtent.start;
      timeExtent.end = TimeExtentUtil.addDuration(timeExtent.start, range);
    } else if (timeSliderConfig.minimalRange) {
      /*
          Minimal range
            Either the start or end date has changed;
            1. ensure that the changed date is still within the valid minimum range:
              a. in case the start date was changed: minDate <= startDate <= maxDate - range
              b. in case the end date was changed:   maxDate >= endDate >= minDate + range
            2. if the difference between the new start and end date is under the given minimum range then
               adjust the value of the previously unchanged value accordingly to enforce the minimal range between them
         */
      const startEndDiff: number = Math.abs(dayjs(timeExtent.start).diff(timeExtent.end));
      const minimalRange: Duration = dayjs.duration(timeSliderConfig.minimalRange);

      if (startEndDiff < minimalRange.asMilliseconds()) {
        const hasStartDateChanged: boolean = !oldValue || Math.abs(dayjs(timeExtent.start).diff(oldValue.start)) > 0;
        if (hasStartDateChanged) {
          const maximumRangeStartDate: Date = TimeExtentUtil.subtractDuration(maximumDate, minimalRange);
          timeExtent.start = timeExtent.start > maximumRangeStartDate ? maximumRangeStartDate : timeExtent.start;
          timeExtent.end = TimeExtentUtil.addDuration(timeExtent.start, minimalRange);
        } else {
          const minimumRangeEndDate: Date = TimeExtentUtil.addDuration(minimumDate, minimalRange);
          timeExtent.end = timeExtent.end < minimumRangeEndDate ? minimumRangeEndDate : timeExtent.end;
          timeExtent.start = TimeExtentUtil.subtractDuration(timeExtent.end, minimalRange);
        }
      }
    }

    return timeExtent;
  }

  /**
   * Creates stops which define specific locations on the time slider where thumbs will snap to when manipulated.
   */
  private createStops(timeSliderConfig: TimeSliderConfiguration): __esri.StopsByInterval | __esri.StopsByDates | undefined {
    switch (timeSliderConfig.sourceType) {
      case 'parameter':
        return this.createStopsForParameterSource(timeSliderConfig);
      case 'layer':
        return this.createStopsForLayerSource(timeSliderConfig);
    }
  }

  /**
   * Creates stops for a layer source containing multiple dates which may not necessarily have constant gaps between them.
   */
  private createStopsForLayerSource(timeSliderConfig: TimeSliderConfiguration): __esri.StopsByDates {
    const timeSliderLayerSource = timeSliderConfig.source as TimeSliderLayerSource;
    const dates = timeSliderLayerSource.layers.map((l) => dayjs(l.date, timeSliderConfig.dateFormat).toDate());
    return {
      dates: dates
    } as __esri.StopsByDates;
  }

  /**
   * Creates stops for a parameter source.
   *
   * @remarks
   * This is done by using a strict interval (e.g. one year) if the default range duration only contains
   * a single type of unit (e.g. 'years'). Otherwise a more generic approach is used by creating date stops from
   * start to finish using the given duration; this can lead to gaps near the end but supports all cases.
   */
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

    // try to return as interval (cleanest solution)
    const unit = TimeExtentUtil.extractUnitFromDuration(initialRangeDuration);
    if (unit) {
      const esriUnit = this.transformToEsriTimeIntervalUnit(unit);
      const value = TimeExtentUtil.getDurationAsNumber(initialRangeDuration, unit);
      return {
        interval: {
          unit: esriUnit,
          value: value
        }
      } as __esri.StopsByInterval;
    }

    // interval was not possible - use a more generic solution instead
    const dates: Date[] = [];
    let date = minimumDate;
    while (date < maximumDate) {
      dates.push(date);
      date = TimeExtentUtil.addDuration(date, initialRangeDuration);
    }
    dates.push(maximumDate);
    return {
      dates: dates
    } as __esri.StopsByDates;
  }

  /**
   * Handles the new time extent value by validating it against the time slider configuration limits first and then emitting that corrected value.
   * @param newValue The new time extent value; this is not necessarily a valid time extent as it can be outside the limitations.
   * @param oldValue The old time extent value.
   * @param activeMapItemId The unique identification of the corresponding active map item.
   * @param timeSlider The corresponding time slider; necessary if the new time extent has to be corrected.
   * @param timeSliderConfig The time slider configuration containing the limitations and rules for this time slider.
   */
  private onTimeExtentChanged(
    newValue: __esri.TimeExtent | undefined,
    oldValue: __esri.TimeExtent | undefined,
    activeMapItemId: string,
    timeSlider: __esri.TimeSlider,
    timeSliderConfig: TimeSliderConfiguration
  ) {
    if (!newValue) {
      return;
    }

    const timeExtent = this.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
    if (Math.abs(dayjs(timeExtent.start).diff(newValue.start)) > 0) {
      timeSlider.timeExtent.start = timeExtent.start;
    }
    if (!timeSliderConfig.range && Math.abs(dayjs(timeExtent.end).diff(newValue.end)) > 0) {
      // don't change the end date if it has a fixed range due to internal logic differences:
      // - Esri Timeslider expects: start === end
      // - Our implementation expects: start === (end - fixed range)
      timeSlider.timeExtent.end = timeExtent.end;
    }

    if (!oldValue || Math.abs(dayjs(oldValue.start).diff(timeExtent.start)) > 0 || Math.abs(dayjs(oldValue.end).diff(timeExtent.end)) > 0) {
      this.timeExtentChanged$.next({activeMapItemId: activeMapItemId, timeExtent: timeExtent});
    }
  }

  private transformToEsriTimeIntervalUnit(unit: ManipulateType): EsriTimeIntervalUnit {
    switch (unit) {
      case 'ms':
      case 'millisecond':
      case 'milliseconds':
        return 'milliseconds';
      case 'second':
      case 'seconds':
      case 's':
        return 'seconds';
      case 'minute':
      case 'minutes':
      case 'm':
        return 'minutes';
      case 'hour':
      case 'hours':
      case 'h':
        return 'hours';
      case 'd':
      case 'D':
      case 'day':
      case 'days':
        return 'days';
      case 'M':
      case 'month':
      case 'months':
        return 'months';
      case 'y':
      case 'year':
      case 'years':
        return 'years';
      case 'w':
      case 'week':
      case 'weeks':
        return 'weeks';
    }
  }

  private transformToEsriTimeExtent(timeExtent: TimeExtent, timeSliderConfig: TimeSliderConfiguration): __esri.TimeExtent {
    const esriTimeExtent = new EsriTimeExtent({start: timeExtent.start, end: timeExtent.end});
    if (timeSliderConfig.range) {
      // if a range is given then the end date should be the same as the end date
      esriTimeExtent.end = esriTimeExtent.start;
    }
    return esriTimeExtent;
  }
}
