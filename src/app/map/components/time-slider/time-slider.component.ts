import {Component, computed, effect, inject, input, linkedSignal, output, signal} from '@angular/core';
import {TimeExtent} from '../../interfaces/time-extent.interface';
import {TimeSliderConfiguration} from '../../../shared/interfaces/topic.interface';
import {TimeSliderService} from '../../services/time-slider.service';
import {MatDatepicker, MatDatepickerInput} from '@angular/material/datepicker';
import {DateUnit} from '../../../shared/types/date-unit.type';
import {TIME_SERVICE} from '../../../app.tokens';
import {SliderWrapperComponent} from '../../../shared/components/slider-wrapper/slider-wrapper.component';
import {MatSlider, MatSliderRangeThumb, MatSliderThumb} from '@angular/material/slider';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

import {TimeExtentToStringPipe} from '../../pipes/time-extent-to-string.pipe';
import {DateToStringPipe} from '../../pipes/date-to-string.pipe';

// There is an array (`allowedDatePickerManipulationUnits`) and a new union type (`DatePickerManipulationUnits`) for two reasons:
// To be able to extract a union type subset of `ManipulateType` AND to have an array used to check if a given value is in said union type.
// => more infos: https://stackoverflow.com/questions/50085494/how-to-check-if-a-given-value-is-in-a-union-type-array
const allowedDatePickerManipulationUnits = ['years', 'months', 'days'] as const; // TS3.4 syntax
type DatePickerManipulationUnits = Extract<DateUnit, (typeof allowedDatePickerManipulationUnits)[number]>;
type DatePickerStartView = 'month' | 'year' | 'multi-year';

@Component({
  selector: 'time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.scss'],
  imports: [
    SliderWrapperComponent,
    MatSlider,
    MatSliderThumb,
    FormsModule,
    MatSliderRangeThumb,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatDatepicker,
    MatButton,
    TimeExtentToStringPipe,
    DateToStringPipe,
  ],
})
export class TimeSliderComponent {
  private readonly timeSliderService = inject(TimeSliderService);
  private readonly timeService = inject(TIME_SERVICE);

  public readonly changeTimeExtentEvent = output<TimeExtent>();

  public readonly initialTimeExtent = input.required<TimeExtent>();
  public readonly timeSliderConfiguration = input.required<TimeSliderConfiguration>();

  public readonly availableDates = computed(() => {
    return this.timeSliderService.createStops(this.timeSliderConfiguration());
  });

  public readonly timeExtent = linkedSignal<TimeExtent>(() => {
    return {start: this.initialTimeExtent().start, end: this.initialTimeExtent().end};
  });

  public readonly firstSliderPosition = linkedSignal<number>(() => this.findPositionOfDate(this.timeExtent().start) ?? 0);
  // the second slider position is `undefined` in case that there is a fixed range
  public readonly secondSliderPosition = linkedSignal<number | undefined>(() =>
    this.timeSliderConfiguration().range ? undefined : this.findPositionOfDate(this.timeExtent().end),
  );

  public readonly minimumDateIndex = signal(0);
  public readonly maximumDateIndex = computed(() => this.availableDates().length);

  // the time slider shows a simple current value (e.g. `2001` instead of `2001-2002`) if it has a range of exactly one of a single time unit (year, month, ...)
  public readonly hasSimpleCurrentValue = computed(() => this.isStringSingleTimeUnitRange(this.timeSliderConfiguration().range));

  // date picker options
  public readonly hasDatePicker = computed(() => this.timeSliderConfiguration().sourceType === 'parameter');
  public readonly datePickerStartView = computed<DatePickerStartView>(() => {
    if (!this.hasDatePicker()) {
      return 'month';
    }

    return this.createDatePickerStartView(this.datePickerUnit());
  });
  private readonly datePickerUnit = computed<DatePickerManipulationUnits>(() => {
    if (!this.hasDatePicker()) {
      return 'days';
    }

    return this.extractUniqueDatePickerUnitFromDateFormat(this.timeSliderConfiguration().dateFormat) ?? 'days';
  });

  constructor() {
    effect(() => {
      // This is needed to update the timeExtent when opening a favourite containing a map with a timeslider that is currently visible
      const newTimeExtent = this.initialTimeExtent();
      if (newTimeExtent) {
        const start = newTimeExtent.start;
        const end = newTimeExtent.end;
        queueMicrotask(() => {
          this.timeExtent.set({start, end});
          this.firstSliderPosition.set(this.findPositionOfDate(start) ?? 0);
          this.secondSliderPosition.set(this.timeSliderConfiguration().range ? undefined : this.findPositionOfDate(end));
        });
      }
    });
  }

  /**
   * Sets a new validated time extent using the current slider position(s).
   * @param hasStartDateChanged A value indicating whether the start date has changed; otherwise the end date has changed.
   */
  public setValidTimeExtent(hasStartDateChanged: boolean) {
    // create a new time extent based on the current slider position(s)
    const newTimeExtent: TimeExtent = {
      start: this.availableDates()[this.firstSliderPosition()],
      end: this.secondSliderPosition()
        ? this.availableDates()[this.secondSliderPosition() || 0]
        : this.availableDates()[this.firstSliderPosition()],
    };
    // calculate a valid time extent based on the new one
    // it can differ to the given time extent due to active limitations such as a minimal range between start and end time
    const newValidatedTimeExtent = this.timeSliderService.createValidTimeExtent(
      this.timeSliderConfiguration(),
      newTimeExtent,
      hasStartDateChanged,
      this.availableDates()[this.minimumDateIndex()],
      this.availableDates()[this.maximumDateIndex()],
    );

    // correct the thumb that was modified with the calculated time extent if necessary (e.g. enforcing a minimal range)
    const hasStartTimeBeenCorrected =
      this.timeService.calculateDifferenceBetweenDates(newValidatedTimeExtent.start, newTimeExtent.start) > 0;
    if (hasStartTimeBeenCorrected) {
      this.firstSliderPosition.set(this.findPositionOfDate(newValidatedTimeExtent.start) ?? 0);
    }
    const hasEndTimeBeenCorrected = this.timeService.calculateDifferenceBetweenDates(newValidatedTimeExtent.end, newTimeExtent.end) > 0;
    if (!this.timeSliderConfiguration().range && hasEndTimeBeenCorrected) {
      this.secondSliderPosition.set(this.findPositionOfDate(newValidatedTimeExtent.end) ?? 0);
    }

    // overwrite the current time extent and trigger the corresponding event if the new validated time extent is different from the previous one
    if (
      this.timeService.calculateDifferenceBetweenDates(this.timeExtent().start, newValidatedTimeExtent.start) > 0 ||
      this.timeService.calculateDifferenceBetweenDates(this.timeExtent().end, newValidatedTimeExtent.end) > 0
    ) {
      this.timeExtent.set(newValidatedTimeExtent);
      this.changeTimeExtentEvent.emit(this.timeExtent());
    }
  }

  public yearOrMonthSelected(
    $event: Date | null,
    datePicker: MatDatepicker<Date>,
    changedMinimumDate: boolean,
    currentDatePickerSelectionUnit: DatePickerManipulationUnits,
  ) {
    if (currentDatePickerSelectionUnit === this.datePickerUnit()) {
      this.selectedDatePickerDate($event, changedMinimumDate);
      datePicker.close();
    }
  }

  public selectedDatePickerDate(eventDate: Date | null, changedMinimumDate: boolean) {
    if (eventDate === null) {
      return;
    }

    // format the given event date to the configured time format and back to ensure that it is a valid date within the current available dates
    const date = this.timeService.createDateFromString(
      this.timeService.getDateAsFormattedString(eventDate, this.timeSliderConfiguration().dateFormat),
      this.timeSliderConfiguration().dateFormat,
    );
    const position = this.findPositionOfDate(date);
    if (position !== undefined) {
      if (changedMinimumDate) {
        this.firstSliderPosition.set(position);
      } else {
        this.secondSliderPosition.set(position);
      }
      this.setValidTimeExtent(changedMinimumDate);
    }
  }

  private isStringSingleTimeUnitRange(range: string | null | undefined): boolean {
    return range ? this.timeService.isStringSingleTimeUnitRange(range) : false;
  }

  private extractUniqueDatePickerUnitFromDateFormat(dateFormat: string): DatePickerManipulationUnits | undefined {
    const unit = this.timeSliderService.extractUniqueUnitFromDateFormat(dateFormat);
    if (unit !== undefined && allowedDatePickerManipulationUnits.some((allowedUnit) => allowedUnit === unit)) {
      return unit as DatePickerManipulationUnits;
    }
    return undefined;
  }

  private findPositionOfDate(date: Date): number | undefined {
    const index = this.availableDates().findIndex(
      (availableDate) => this.timeService.calculateDifferenceBetweenDates(availableDate, date) === 0,
    );
    return index === -1 ? undefined : index;
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
