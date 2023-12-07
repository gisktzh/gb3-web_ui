import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TimeExtent} from '../../interfaces/time-extent.interface';
import {TimeSliderConfiguration, TimeSliderLayerSource} from '../../../shared/interfaces/topic.interface';
import dayjs, {ManipulateType} from 'dayjs';
import {TimeSliderService} from '../../services/time-slider.service';
import {TimeExtentUtils} from '../../../shared/utils/time-extent.utils';
import duration from 'dayjs/plugin/duration';
import {MatDatepicker} from '@angular/material/datepicker';

dayjs.extend(duration);

// There is an array (`allowedDatePickerManipulationUnits`) and a new union type (`DatePickerManipulationUnits`) for two reasons:
// To be able to extract a union type subset of `ManipulateType` AND to have an array used to check if a given value is in said union type.
// => more infos: https://stackoverflow.com/questions/50085494/how-to-check-if-a-given-value-is-in-a-union-type-array
const allowedDatePickerManipulationUnits = ['years', 'months', 'days'] as const; // TS3.4 syntax
type DatePickerManipulationUnits = Extract<ManipulateType, (typeof allowedDatePickerManipulationUnits)[number]>;
type DatePickerStartView = 'month' | 'year' | 'multi-year';

@Component({
  selector: 'time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.scss'],
})
export class TimeSliderComponent implements OnInit {
  @Output() public readonly changeTimeExtentEvent = new EventEmitter<TimeExtent>();

  @Input() public initialTimeExtent!: TimeExtent;
  @Input() public timeSliderConfiguration!: TimeSliderConfiguration;

  public availableDates: Date[] = [];

  public firstSliderPosition: number = 0;
  // the second slider position is `undefined` in case that there is a fixed range
  public secondSliderPosition?: number;

  public formattedTimeExtent: string = '';
  public formattedEffectiveMinimumDate: string = '';
  public formattedEffectiveMaximumDate: string = '';

  // date picker options
  public hasDatePicker: boolean = false;
  public datePickerStartView: DatePickerStartView = 'month';
  private datePickerUnit: DatePickerManipulationUnits = 'days';

  // the time slider shows a simple current value (e.g. `2001` instead of `2001-2002`) if it has a range of exactly one of a single time unit (year, month, ...)
  private hasSimpleCurrentValue: boolean = false;

  private _timeExtent!: TimeExtent;
  private _effectiveMinimumDateNumber!: number;
  private _effectiveMaximumDateNumber!: number;

  public get timeExtent(): TimeExtent {
    return this._timeExtent;
  }

  private set timeExtent(value: TimeExtent) {
    this._timeExtent = value;
    this.formattedTimeExtent = this.convertTimeExtentToString(value, this.hasSimpleCurrentValue);
  }

  public get effectiveMinimumDateNumber(): number {
    return this._effectiveMinimumDateNumber;
  }

  private set effectiveMinimumDateNumber(value: number) {
    this._effectiveMinimumDateNumber = value;
    this.formattedEffectiveMinimumDate = this.convertDateToString(this.availableDates[value]);
  }

  public get effectiveMaximumDateNumber(): number {
    return this._effectiveMaximumDateNumber;
  }

  private set effectiveMaximumDateNumber(value: number) {
    this._effectiveMaximumDateNumber = value;
    this.formattedEffectiveMaximumDate = this.convertDateToString(this.availableDates[value]);
  }

  constructor(private readonly timeSliderService: TimeSliderService) {}

  public ngOnInit() {
    this.availableDates = this.timeSliderService.createStops(this.timeSliderConfiguration);
    this.effectiveMinimumDateNumber = 0;
    this.effectiveMaximumDateNumber = this.availableDates.length - 1;
    this.timeExtent = {start: this.initialTimeExtent.start, end: this.initialTimeExtent.end};
    this.firstSliderPosition = this.findPositionOfDate(this.timeExtent.start) ?? 0;
    this.secondSliderPosition = this.timeSliderConfiguration.range ? undefined : this.findPositionOfDate(this.timeExtent.end);
    this.hasSimpleCurrentValue = this.isRangeExactlyOneOfSingleTimeUnit(this.timeSliderConfiguration.range);

    // date picker
    this.hasDatePicker = this.isRangeContinuousWithinAllowedTimeUnits(this.timeSliderConfiguration);
    if (this.hasDatePicker) {
      this.datePickerUnit = this.extractUniqueDatePickerUnitFromDateFormat(this.timeSliderConfiguration.dateFormat) ?? 'days';
      this.datePickerStartView = this.createDatePickerStartView(this.datePickerUnit);
    }
  }

  public refreshCurrentValue() {
    const currentTimeExtent: TimeExtent = {
      start: this.availableDates[this.firstSliderPosition],
      end: this.secondSliderPosition ? this.availableDates[this.secondSliderPosition] : this.availableDates[this.firstSliderPosition],
    };
    this.formattedTimeExtent = this.convertTimeExtentToString(currentTimeExtent, this.hasSimpleCurrentValue);
  }

  /**
   * Sets a new validated time extent using the current slider position(s).
   * @param hasStartDateChanged A value indicating whether the start date has changed; otherwise the end date has changed.
   */
  public setValidTimeExtent(hasStartDateChanged: boolean) {
    // create a new time extent based on the current slider position(s)
    const newTimeExtent: TimeExtent = {
      start: this.availableDates[this.firstSliderPosition],
      end: this.secondSliderPosition ? this.availableDates[this.secondSliderPosition] : this.availableDates[this.firstSliderPosition],
    };
    // calculate a valid time extent based on the new one
    // it can differ to the given time extent due to active limitations such as a minimal range between start and end time
    const newValidatedTimeExtent = this.timeSliderService.createValidTimeExtent(
      this.timeSliderConfiguration,
      newTimeExtent,
      hasStartDateChanged,
      this.availableDates[this.effectiveMinimumDateNumber],
      this.availableDates[this.effectiveMaximumDateNumber],
    );

    // correct the thumb that was modified with the calculated time extent if necessary (e.g. enforcing a minimal range)
    const hasStartTimeBeenCorrected =
      TimeExtentUtils.calculateDifferenceBetweenDates(newValidatedTimeExtent.start, newTimeExtent.start) > 0;
    if (hasStartTimeBeenCorrected) {
      this.firstSliderPosition = this.findPositionOfDate(newValidatedTimeExtent.start) ?? 0;
    }
    const hasEndTimeBeenCorrected = TimeExtentUtils.calculateDifferenceBetweenDates(newValidatedTimeExtent.end, newTimeExtent.end) > 0;
    if (!this.timeSliderConfiguration.range && hasEndTimeBeenCorrected) {
      this.secondSliderPosition = this.findPositionOfDate(newValidatedTimeExtent.end) ?? 0;
    }

    // overwrite the current time extent and trigger the corresponding event if the new validated time extent is different from the previous one
    if (
      TimeExtentUtils.calculateDifferenceBetweenDates(this.timeExtent.start, newValidatedTimeExtent.start) > 0 ||
      TimeExtentUtils.calculateDifferenceBetweenDates(this.timeExtent.end, newValidatedTimeExtent.end) > 0
    ) {
      this.timeExtent = newValidatedTimeExtent;
      this.changeTimeExtentEvent.emit(this.timeExtent);
    }

    // set the current time extent even if there is no difference; it's still possible that a value was automatically corrected
    this.formattedTimeExtent = this.convertTimeExtentToString(this.timeExtent, this.hasSimpleCurrentValue);
  }

  public convertDateToString(value?: Date): string {
    return value ? dayjs(value).format(this.timeSliderConfiguration.dateFormat) : '';
  }

  public yearOrMonthSelected(
    $event: Date | null,
    datePicker: MatDatepicker<Date>,
    changedMinimumDate: boolean,
    currentDatePickerSelectionUnit: DatePickerManipulationUnits,
  ) {
    if (currentDatePickerSelectionUnit === this.datePickerUnit) {
      this.selectedDatePickerDate($event, changedMinimumDate);
      datePicker.close();
    }
  }

  public selectedDatePickerDate(eventDate: Date | null, changedMinimumDate: boolean) {
    if (eventDate === null) {
      return;
    }
    // format the given event date to the configured time format and back to ensure that it is a valid date within the current available dates
    const date = dayjs(dayjs(eventDate).format(this.timeSliderConfiguration.dateFormat), this.timeSliderConfiguration.dateFormat).toDate();
    const position = this.findPositionOfDate(date);
    if (position !== undefined) {
      if (changedMinimumDate) {
        this.effectiveMinimumDateNumber = position;
      } else {
        this.effectiveMaximumDateNumber = position;
      }
      this.setValidTimeExtent(changedMinimumDate);
    }
  }

  /**
   * Returns `true` if the given range is defined and is exactly one of a single time unit (year, month, ...).
   * If the optional parameter `allowedTimeUnits` is given then only the units in there are allowed; all other return `false` as well.
   * @param range The range (in ISO-8601 time span format) to be evaluated
   *
   * @example
   * `P1Y1M` is a duration of one year AND one month which is more than one time unit; therefore is the result `false`
   * `P2Y` is a duration of two years which is more than one of a single time unit; therefore is the result `false`
   * `P1D` is a duration of one day which is exactly one of a single time unit; therefore the result is `true`
   */
  private isRangeExactlyOneOfSingleTimeUnit(range: string | null | undefined): boolean {
    if (range) {
      const rangeDuration = dayjs.duration(range);
      const unit = TimeExtentUtils.extractUniqueUnitFromDuration(rangeDuration);
      return unit !== undefined && TimeExtentUtils.getDurationAsNumber(rangeDuration, unit) === 1;
    }
    return false;
  }

  /**
   * Returns `true` the given date format contains only one unique unit (e.g. 'years') and the source is either of
   * type `parameter` or if it's of type `layer` then there is a continuous strictly monotonously rising series of layer dates.
   */
  private isRangeContinuousWithinAllowedTimeUnits(timeSliderConfiguration: TimeSliderConfiguration): boolean {
    let isRangeContinuousWithinAllowedTimeUnits = false;
    const unit = this.extractUniqueDatePickerUnitFromDateFormat(timeSliderConfiguration.dateFormat);
    if (unit) {
      switch (timeSliderConfiguration.sourceType) {
        case 'parameter':
          isRangeContinuousWithinAllowedTimeUnits = true;
          break;
        case 'layer':
          isRangeContinuousWithinAllowedTimeUnits = this.isLayerSourceContinuous(
            <TimeSliderLayerSource>timeSliderConfiguration.source,
            unit,
          );
          break;
      }
    }
    return isRangeContinuousWithinAllowedTimeUnits;
  }

  private extractUniqueDatePickerUnitFromDateFormat(dateFormat: string): DatePickerManipulationUnits | undefined {
    const unit = TimeExtentUtils.extractUniqueUnitFromDateFormat(dateFormat);
    if (unit !== undefined && allowedDatePickerManipulationUnits.some((allowedUnit) => allowedUnit === unit)) {
      return unit as DatePickerManipulationUnits;
    }
    return undefined;
  }

  private isLayerSourceContinuous(layerSource: TimeSliderLayerSource, unit: DatePickerManipulationUnits): boolean {
    const dateAsAscendingSortedNumbers = layerSource.layers.map((layer) => dayjs(layer.date, unit).get(unit)).sort((a, b) => a - b);
    // all date numbers must be part of a continuous and strictly monotonously rising series each with exactly
    // one step between them: `date[0] = x` => `date[n] = x + n`
    return !dateAsAscendingSortedNumbers.some((dateAsNumber, index) => dateAsNumber !== dateAsAscendingSortedNumbers[0] + index);
  }

  private findPositionOfDate(date: Date): number | undefined {
    const index = this.availableDates.findIndex(
      (availableDate) => TimeExtentUtils.calculateDifferenceBetweenDates(availableDate, date) === 0,
    );
    return index === -1 ? undefined : index;
  }

  private convertTimeExtentToString(timeExtent: TimeExtent, hasSimpleCurrentValue: boolean): string {
    return hasSimpleCurrentValue
      ? this.convertDateToString(timeExtent.start)
      : `${this.convertDateToString(timeExtent.start)} - ${this.convertDateToString(timeExtent.end)}`;
  }

  private createDatePickerStartView(datePickerUnit: DatePickerManipulationUnits): DatePickerStartView {
    switch (datePickerUnit) {
      case 'days':
        return 'month';
      case 'months':
        return 'year';
      case 'years':
        return 'multi-year';
    }
  }
}
