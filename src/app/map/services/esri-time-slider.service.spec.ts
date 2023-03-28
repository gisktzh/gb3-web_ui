import {TestBed} from '@angular/core/testing';

import {EsriTimeSliderService} from './esri-time-slider.service';
import {TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import {EsriTimeExtent} from '../external/esri.module';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

describe('EsriTimeSliderService', () => {
  let service: EsriTimeSliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriTimeSliderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createValidTimeExtent', () => {
    describe('using "alwaysMaxRange"', () => {
      const dateFormat = 'YYYY-MM';
      const minimumDate = dayjs('2000-01', dateFormat);
      const maximumDate = dayjs('2001-03', dateFormat);
      const alwaysMaxRange = true;
      const range = undefined;
      const minimalRange = undefined;

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: minimumDate.format(dateFormat),
        maximumDate: maximumDate.format(dateFormat),
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: []
        }
      };

      it('should create always the same time extent using min-/max values', () => {
        const oldValue = undefined;
        const newValue = new EsriTimeExtent({
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-03', dateFormat).toDate()
        });

        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(minimumDate)).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(maximumDate)).toBe(0);
      });
    });
    describe('using "range"', () => {
      const dateFormat = 'YYYY-MM';
      const minimumDate = dayjs('2000-01', dateFormat);
      const maximumDate = dayjs('2001-03', dateFormat);
      const alwaysMaxRange = false;
      const range = 'P1M';
      const minimalRange = undefined;

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: minimumDate.format(dateFormat),
        maximumDate: maximumDate.format(dateFormat),
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: []
        }
      };

      it('should not create a new time extent if it is already valid', () => {
        const oldValue = undefined;
        const newValue = new EsriTimeExtent({
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-03', dateFormat).toDate()
        });
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(newValue.start)).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(newValue.end)).toBe(0);
      });

      it('should create a new end date if it is valid', () => {
        const oldValue = undefined;
        const newValue = new EsriTimeExtent({start: maximumDate.toDate(), end: minimumDate.toDate()});
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2001-03', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2001-04', dateFormat))).toBe(0);
      });

      it('should create a new start date if it is smaller than the minimum date', () => {
        const oldValue = undefined;
        const newValue = new EsriTimeExtent({start: minimumDate.subtract(dayjs.duration('P1M')).toDate(), end: minimumDate.toDate()});
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000-01', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2000-02', dateFormat))).toBe(0);
      });

      it('should create a new start date if it is bigger than the maximum date', () => {
        const oldValue = undefined;
        const newValue = new EsriTimeExtent({start: maximumDate.add(dayjs.duration('P1M')).toDate(), end: minimumDate.toDate()});
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2001-03', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2001-04', dateFormat))).toBe(0);
      });
    });
    describe('using "minimalRange"', () => {
      const dateFormat = 'YYYY-MM';
      const minimumDate = dayjs('2000-01', dateFormat);
      const maximumDate = dayjs('2001-03', dateFormat);
      const alwaysMaxRange = false;
      const range = undefined;
      const minimalRange = 'P2M';

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: minimumDate.format(dateFormat),
        maximumDate: maximumDate.format(dateFormat),
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: []
        }
      };

      it('should not create a new time extent if it is already valid', () => {
        const oldValue = new EsriTimeExtent({
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-04', dateFormat).toDate()
        });
        const newValue = new EsriTimeExtent({
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-05', dateFormat).toDate()
        });
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(newValue.start)).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(newValue.end)).toBe(0);
      });

      it('should create a new start/end date if it is over/under the limits', () => {
        const oldValue = undefined;
        const newValue = new EsriTimeExtent({
          start: dayjs('1999-12', dateFormat).toDate(),
          end: dayjs('2001-04', dateFormat).toDate()
        });
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(minimumDate)).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(maximumDate)).toBe(0);
      });

      it('should create a new end date if the new start date is too close to the original end date', () => {
        const oldValue = new EsriTimeExtent({
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-04', dateFormat).toDate()
        });
        const newValue = new EsriTimeExtent({
          start: dayjs('2000-03', dateFormat).toDate(),
          end: dayjs('2000-04', dateFormat).toDate()
        });
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000-03', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2000-05', dateFormat))).toBe(0);
      });

      it('should create a new start date if the new end date is too close to the original start date', () => {
        const oldValue = new EsriTimeExtent({
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-04', dateFormat).toDate()
        });
        const newValue = new EsriTimeExtent({
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-03', dateFormat).toDate()
        });
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000-01', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2000-03', dateFormat))).toBe(0);
      });

      it('should create a new start date if if is too close to the end date and the end date is the maximum possible date', () => {
        const oldValue = new EsriTimeExtent({
          start: dayjs('2001-01', dateFormat).toDate(),
          end: dayjs('2001-03', dateFormat).toDate()
        });
        const newValue = new EsriTimeExtent({
          start: dayjs('2001-02', dateFormat).toDate(),
          end: dayjs('2001-03', dateFormat).toDate()
        });
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2001-01', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2001-03', dateFormat))).toBe(0);
      });
    });

    it('should use the correct range in case of years', () => {
      const dateFormat = 'YYYY';
      const minimumDate = '2000';
      const maximumDate = '2002';
      const alwaysMaxRange = false;
      const range = 'P1Y';
      const minimalRange = undefined;

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: minimumDate,
        maximumDate: maximumDate,
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: []
        }
      };
      const oldValue = new EsriTimeExtent({start: dayjs(minimumDate, dateFormat).toDate(), end: dayjs(maximumDate, dateFormat).toDate()});
      const newValue = new EsriTimeExtent({start: dayjs(minimumDate, dateFormat).toDate(), end: dayjs(minimumDate, dateFormat).toDate()});

      const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, oldValue);
      expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000', dateFormat).toDate())).toBe(0);
      expect(dayjs(calculatedTimeExtent.start).format(timeSliderConfig.dateFormat)).toBe('2000');
      expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2001', dateFormat).toDate())).toBe(0);
      expect(dayjs(calculatedTimeExtent.end).format(timeSliderConfig.dateFormat)).toBe('2001');
    });
  });
});
