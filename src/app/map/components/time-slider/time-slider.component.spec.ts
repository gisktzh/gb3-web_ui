import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {TimeSliderService} from '../../services/time-slider.service';
import {TimeSliderComponent} from './time-slider.component';
import {TimeExtent} from '../../interfaces/time-extent.interface';
import {TimeSliderConfiguration} from '../../../shared/interfaces/topic.interface';
import {TIME_SERVICE} from '../../../app.tokens';
import {Mock} from 'vitest';
import {MatDatepicker} from '@angular/material/datepicker';
import {TimeService} from 'src/app/shared/interfaces/time-service.interface';
import {provideNativeDateAdapter} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {SliderWrapperComponent} from 'src/app/shared/components/slider-wrapper/slider-wrapper.component';

describe('TimeSliderComponent', () => {
  let component: TimeSliderComponent;
  let fixture: ComponentFixture<TimeSliderComponent>;
  let compiled: HTMLElement;

  const dates = [
    new Date('2020-01-01T00:00:00'),
    new Date('2020-02-01T00:00:00'),
    new Date('2020-03-01T00:00:00'),
    new Date('2020-04-01T00:00:00'),
  ];

  const timeSliderServiceMock: Partial<TimeSliderService> = {
    createStops: vi.fn().mockReturnValue(dates),
    createValidTimeExtent: vi.fn(),
    extractUniqueUnitFromDateFormat: vi.fn(),
  };

  const timeServiceMock: Partial<TimeService> = {
    calculateDifferenceBetweenDates: vi.fn((first: Date, second: Date) => first.getTime() - second.getTime()),
    createDateFromString: vi.fn((value: string) => new Date(value)),
    getDateAsFormattedString: vi.fn((date: Date) => date.toISOString().slice(0, 10)),
    isStringSingleTimeUnitRange: vi.fn(),
  };

  const initialTimeExtent = signal<TimeExtent>({
    start: dates[0],
    end: dates[2],
  });

  const timeSliderConfiguration = signal<TimeSliderConfiguration>({
    name: 'Time slider',
    description: 'Time slider description',
    range: undefined,
    sourceType: 'parameter',
    dateFormat: 'yyyy-MM-dd',
  } as TimeSliderConfiguration);

  let changeTimeExtentEventSpy: Mock;

  beforeEach(async () => {
    vi.clearAllMocks();

    timeSliderServiceMock.createStops = vi.fn().mockReturnValue(dates);
    timeSliderServiceMock.createValidTimeExtent = vi
      .fn()
      .mockImplementation((_configuration: TimeSliderConfiguration, extent: TimeExtent) => extent);
    timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue('days');

    timeServiceMock.calculateDifferenceBetweenDates = vi.fn((first: Date, second: Date) => first.getTime() - second.getTime());
    timeServiceMock.createDateFromString = vi.fn((value: string) => new Date(value));
    timeServiceMock.getDateAsFormattedString = vi.fn((date: Date) => date.toISOString().slice(0, 10));
    timeServiceMock.isStringSingleTimeUnitRange = vi.fn().mockReturnValue(false);

    initialTimeExtent.set({
      start: dates[0],
      end: dates[2],
    });

    timeSliderConfiguration.set({
      name: 'Time slider',
      description: 'Time slider description',
      range: undefined,
      sourceType: 'parameter',
      dateFormat: 'yyyy-MM-dd',
    } as TimeSliderConfiguration);

    await TestBed.configureTestingModule({
      imports: [TimeSliderComponent],
      providers: [
        {provide: TimeSliderService, useValue: timeSliderServiceMock},
        {provide: TIME_SERVICE, useValue: timeServiceMock},
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSliderComponent, {
      bindings: [inputBinding('initialTimeExtent', initialTimeExtent), inputBinding('timeSliderConfiguration', timeSliderConfiguration)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
    await fixture.whenStable();

    changeTimeExtentEventSpy = vi.spyOn(component.changeTimeExtentEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('availableDates', () => {
    it('should use the dates created by the time slider service', () => {
      expect(component.availableDates()).toEqual(dates);
      expect(timeSliderServiceMock.createStops).toHaveBeenCalledWith(timeSliderConfiguration());
    });
  });

  describe('timeExtent', () => {
    it('should initialize from the initial time extent', () => {
      expect(component.timeExtent()).toEqual({
        start: dates[0],
        end: dates[2],
      });
    });

    it('should update when the initial time extent changes', async () => {
      const newTimeExtent = {
        start: dates[1],
        end: dates[3],
      };

      initialTimeExtent.set(newTimeExtent);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.timeExtent()).toEqual(newTimeExtent);
    });
  });

  describe('slider positions', () => {
    it('should initialize the first slider position from the start date', () => {
      expect(component.firstSliderPosition()).toBe(0);
    });

    it('should initialize the second slider position from the end date', () => {
      expect(component.secondSliderPosition()).toBe(2);
    });

    it('should use zero when the initial start date is not available', async () => {
      initialTimeExtent.set({
        start: new Date('2021-01-01T00:00:00'),
        end: dates[2],
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.firstSliderPosition()).toBe(0);
    });

    it('should set the second slider position to undefined for a fixed range', async () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        range: '2020',
      } as TimeSliderConfiguration);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.secondSliderPosition()).toBeUndefined();
    });

    it('should update slider positions when the initial time extent changes', async () => {
      initialTimeExtent.set({
        start: dates[1],
        end: dates[3],
      });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.firstSliderPosition()).toBe(1);
      expect(component.secondSliderPosition()).toBe(3);
    });
  });

  describe('maximumDateIndex', () => {
    it('should return the last available date index', () => {
      expect(component.maximumDateIndex()).toBe(3);
    });
  });

  describe('hasSimpleCurrentValue', () => {
    it('should return false when there is no range', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        range: undefined,
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.hasSimpleCurrentValue()).toBe(false);
      expect(timeServiceMock.isStringSingleTimeUnitRange).not.toHaveBeenCalled();
    });

    it('should delegate range detection to the time service', () => {
      timeServiceMock.isStringSingleTimeUnitRange = vi.fn().mockReturnValue(true);

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        range: '2020',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.hasSimpleCurrentValue()).toBe(true);
      expect(timeServiceMock.isStringSingleTimeUnitRange).toHaveBeenCalledWith('2020');
    });
  });

  describe('date picker', () => {
    it('should be enabled for parameter source types', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.hasDatePicker()).toBe(true);
    });

    it('should be disabled for non-parameter source types', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'layer',
      });

      fixture.detectChanges();

      expect(component.hasDatePicker()).toBe(false);
      expect(component.datePickerStartView()).toBe('month');
    });

    it('should use month as the start view for days', () => {
      timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue('days');

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
        dateFormat: 'yyyy-MM-dd',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.datePickerStartView()).toBe('month');
    });

    it('should use year as the start view for months', () => {
      timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue('months');

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
        dateFormat: 'yyyy-MM',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.datePickerStartView()).toBe('year');
    });

    it('should use multi-year as the start view for years', () => {
      timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue('years');

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
        dateFormat: 'yyyy',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.datePickerStartView()).toBe('multi-year');
    });

    it('should fall back to days when the extracted unit is unsupported', () => {
      timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue('hours');

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
        dateFormat: 'yyyy-MM-dd HH',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.datePickerStartView()).toBe('month');
    });

    it('should fall back to days when no unit can be extracted', () => {
      timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue(undefined);

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
        dateFormat: 'unknown',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(component.datePickerStartView()).toBe('month');
    });
  });

  describe('setValidTimeExtent', () => {
    it('should create a time extent from the current slider positions', () => {
      component.firstSliderPosition.set(1);
      component.secondSliderPosition.set(3);

      component.setValidTimeExtent(true);

      expect(timeSliderServiceMock.createValidTimeExtent).toHaveBeenCalledWith(
        timeSliderConfiguration(),
        {
          start: dates[1],
          end: dates[3],
        },
        true,
        dates[0],
        dates[3],
      );
    });

    it('should use the first slider position as the end for a fixed range', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        range: '2020',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      component.firstSliderPosition.set(2);

      component.setValidTimeExtent(true);

      expect(timeSliderServiceMock.createValidTimeExtent).toHaveBeenCalledWith(
        timeSliderConfiguration(),
        {
          start: dates[2],
          end: dates[2],
        },
        true,
        dates[0],
        dates[3],
      );
    });

    it('should update the time extent and emit when the validated extent changes', async () => {
      vi.useFakeTimers();
      const validatedTimeExtent = {
        start: dates[1],
        end: dates[3],
      };

      (timeSliderServiceMock.createValidTimeExtent as Mock).mockReturnValue(validatedTimeExtent);
      (timeServiceMock.calculateDifferenceBetweenDates as Mock).mockReturnValue(1);

      fixture.detectChanges();

      component.firstSliderPosition.set(1);
      component.secondSliderPosition.set(3);

      await vi.runAllTimersAsync();

      component.setValidTimeExtent(true);

      expect(changeTimeExtentEventSpy).toHaveBeenCalledWith(validatedTimeExtent);
      expect(component.timeExtent()).toEqual(validatedTimeExtent);
    });

    it('should not update or emit when the validated extent is unchanged', () => {
      timeSliderServiceMock.createValidTimeExtent = vi.fn().mockReturnValue({
        start: dates[0],
        end: dates[2],
      });

      component.firstSliderPosition.set(0);
      component.secondSliderPosition.set(2);

      component.setValidTimeExtent(true);

      expect(component.timeExtent()).toEqual({
        start: dates[0],
        end: dates[2],
      });
      expect(changeTimeExtentEventSpy).not.toHaveBeenCalled();
    });

    it('should correct the first slider position when the start time is moved forward', () => {
      const validatedTimeExtent = {
        start: dates[2],
        end: dates[3],
      };

      timeSliderServiceMock.createValidTimeExtent = vi.fn().mockReturnValue(validatedTimeExtent);

      component.firstSliderPosition.set(0);
      component.secondSliderPosition.set(3);

      component.setValidTimeExtent(true);

      expect(component.firstSliderPosition()).toBe(2);
    });

    it('should correct the second slider position when the end time is moved forward', () => {
      const validatedTimeExtent = {
        start: dates[0],
        end: dates[3],
      };

      timeSliderServiceMock.createValidTimeExtent = vi.fn().mockReturnValue(validatedTimeExtent);

      component.firstSliderPosition.set(0);
      component.secondSliderPosition.set(1);

      component.setValidTimeExtent(false);

      expect(component.secondSliderPosition()).toBe(3);
    });

    it('should not correct the second slider position for a fixed range', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        range: '2020',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      const validatedTimeExtent = {
        start: dates[2],
        end: dates[2],
      };

      timeSliderServiceMock.createValidTimeExtent = vi.fn().mockReturnValue(validatedTimeExtent);

      component.firstSliderPosition.set(0);
      component.setValidTimeExtent(true);

      expect(component.secondSliderPosition()).toBeUndefined();
    });
  });

  describe('selectedDatePickerDate', () => {
    it('should do nothing for a null date', () => {
      component.selectedDatePickerDate(null, true);

      expect(timeServiceMock.createDateFromString).not.toHaveBeenCalled();
      expect(timeSliderServiceMock.createValidTimeExtent).not.toHaveBeenCalled();
      expect(changeTimeExtentEventSpy).not.toHaveBeenCalled();
    });

    it('should convert the selected date using the configured date format', () => {
      const selectedDate = dates[1];
      const convertedDate = dates[1];

      timeServiceMock.getDateAsFormattedString = vi.fn().mockReturnValue('2020-02-01');
      timeServiceMock.createDateFromString = vi.fn().mockReturnValue(convertedDate);

      component.selectedDatePickerDate(selectedDate, true);

      expect(timeServiceMock.getDateAsFormattedString).toHaveBeenCalledWith(selectedDate, timeSliderConfiguration().dateFormat);
      expect(timeServiceMock.createDateFromString).toHaveBeenCalledWith('2020-02-01', timeSliderConfiguration().dateFormat);
    });

    it('should update the first slider position when the minimum date changes', () => {
      timeServiceMock.createDateFromString = vi.fn().mockReturnValue(dates[1]);
      timeSliderServiceMock.createValidTimeExtent = vi.fn().mockReturnValue({
        start: dates[1],
        end: dates[2],
      });

      component.selectedDatePickerDate(dates[1], true);

      expect(component.firstSliderPosition()).toBe(1);
      expect(component.secondSliderPosition()).toBe(2);
    });

    it('should update the second slider position when the maximum date changes', () => {
      timeServiceMock.createDateFromString = vi.fn().mockReturnValue(dates[3]);
      timeSliderServiceMock.createValidTimeExtent = vi.fn().mockReturnValue({
        start: dates[0],
        end: dates[3],
      });

      component.selectedDatePickerDate(dates[3], false);

      expect(component.firstSliderPosition()).toBe(0);
      expect(component.secondSliderPosition()).toBe(3);
    });

    it('should do nothing when the selected date is not available', () => {
      const unavailableDate = new Date('2021-01-01T00:00:00');

      timeServiceMock.createDateFromString = vi.fn().mockReturnValue(unavailableDate);

      component.selectedDatePickerDate(unavailableDate, true);

      expect(timeSliderServiceMock.createValidTimeExtent).not.toHaveBeenCalled();
      expect(changeTimeExtentEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('yearOrMonthSelected', () => {
    it('should select the date and close the picker when the selected unit matches the configured unit', () => {
      const datePicker = {
        close: vi.fn(),
      } as unknown as MatDatepicker<Date>;

      vi.spyOn(component, 'selectedDatePickerDate');

      timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue('years');

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
        dateFormat: 'yyyy',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      const selectedDate = dates[1];

      component.yearOrMonthSelected(selectedDate, datePicker, true, 'years');

      expect(component.selectedDatePickerDate).toHaveBeenCalledWith(selectedDate, true);
      expect(datePicker.close).toHaveBeenCalled();
    });

    it('should not select or close when the selected unit does not match', () => {
      const datePicker = {
        close: vi.fn(),
      } as unknown as MatDatepicker<Date>;

      vi.spyOn(component, 'selectedDatePickerDate');

      timeSliderServiceMock.extractUniqueUnitFromDateFormat = vi.fn().mockReturnValue('years');

      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
        dateFormat: 'yyyy',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      component.yearOrMonthSelected(dates[1], datePicker, true, 'months');

      expect(component.selectedDatePickerDate).not.toHaveBeenCalled();
      expect(datePicker.close).not.toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should render the configured title and description', () => {
      const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent)).componentInstance;
      expect(sliderWrapper.title()).toBe('Time slider');
      expect(sliderWrapper.description()).toBe('Time slider description');
    });

    it('should render the slider in range mode', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        range: '2020',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(compiled.querySelector('input[matSliderThumb]')).toBeTruthy();
      expect(compiled.querySelector('input[matSliderStartThumb]')).toBeFalsy();
      expect(compiled.querySelector('input[matSliderEndThumb]')).toBeFalsy();
    });

    it('should render two slider thumbs when range mode is disabled', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        range: undefined,
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(compiled.querySelector('input[matSliderThumb]')).toBeFalsy();
      expect(compiled.querySelector('input[matSliderStartThumb]')).toBeTruthy();
      expect(compiled.querySelector('input[matSliderEndThumb]')).toBeTruthy();
    });

    it('should render the date picker footer for parameter source types', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'parameter',
      } as TimeSliderConfiguration);

      fixture.detectChanges();

      expect(compiled.querySelector('.time-slider__footer')).toBeTruthy();
    });

    it('should not render the date picker footer for non-parameter source types', () => {
      timeSliderConfiguration.set({
        ...timeSliderConfiguration(),
        sourceType: 'layer',
      });

      fixture.detectChanges();

      expect(compiled.querySelector('.time-slider__footer')).toBeFalsy();
    });

    it('should render the configured date range in the slider wrapper', () => {
      const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent)).componentInstance;

      expect(sliderWrapper.value()).toBeTruthy();
    });

    it('should render modified styling when the minimum date index is changed', () => {
      component.minimumDateIndex.set(1);
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll('.time-slider__footer__button');

      expect(buttons[0].classList).toContain('time-slider__footer__button--modified');
      expect(buttons[1].classList).not.toContain('time-slider__footer__button--modified');
    });
  });
});
