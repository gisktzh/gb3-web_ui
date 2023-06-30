import {TestBed} from '@angular/core/testing';

import {TimeSliderService} from './time-slider.service';
import * as dayjs from 'dayjs';
import {TimeSliderConfiguration, TimeSliderParameterSource} from '../../shared/interfaces/topic.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';

describe('TimeSliderService', () => {
  let service: TimeSliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeSliderService);
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
        const newValue: TimeExtent = {
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-03', dateFormat).toDate()
        };

        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
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
        const newValue: TimeExtent = {
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-03', dateFormat).toDate()
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(newValue.start)).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(newValue.end)).toBe(0);
      });

      it('should create a new end date if it is valid', () => {
        const newValue: TimeExtent = {start: maximumDate.toDate(), end: minimumDate.toDate()};
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2001-03', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2001-04', dateFormat))).toBe(0);
      });

      it('should create a new start date if it is smaller than the minimum date', () => {
        const newValue: TimeExtent = {start: minimumDate.subtract(dayjs.duration('P1M')).toDate(), end: minimumDate.toDate()};
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000-01', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2000-02', dateFormat))).toBe(0);
      });

      it('should create a new start date if it is bigger than the maximum date', () => {
        const newValue: TimeExtent = {start: maximumDate.add(dayjs.duration('P1M')).toDate(), end: minimumDate.toDate()};
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
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
        const newValue: TimeExtent = {
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-05', dateFormat).toDate()
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(newValue.start)).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(newValue.end)).toBe(0);
      });

      it('should create a new start/end date if it is over/under the limits', () => {
        const newValue: TimeExtent = {
          start: dayjs('1999-12', dateFormat).toDate(),
          end: dayjs('2001-04', dateFormat).toDate()
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(minimumDate)).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(maximumDate)).toBe(0);
      });

      it('should adjust the start date if the new start date is too close to the original start date', () => {
        const newValue: TimeExtent = {
          start: dayjs('2000-03', dateFormat).toDate(),
          end: dayjs('2000-04', dateFormat).toDate()
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000-02', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2000-04', dateFormat))).toBe(0);
      });

      it('should adjust the end date if the new end date is too close to the original end date', () => {
        const newValue: TimeExtent = {
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-03', dateFormat).toDate()
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          false,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000-02', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2000-04', dateFormat))).toBe(0);
      });

      it('should create a new start date if if is too close to the end date and the end date is the maximum possible date', () => {
        const newValue: TimeExtent = {
          start: dayjs('2001-02', dateFormat).toDate(),
          end: dayjs('2001-03', dateFormat).toDate()
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          minimumDate.toDate(),
          maximumDate.toDate()
        );
        expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2001-01', dateFormat))).toBe(0);
        expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2001-03', dateFormat))).toBe(0);
      });
    });

    it('should use the correct range in case of years', () => {
      const dateFormat = 'YYYY';
      const minimumDate = dayjs('2000', dateFormat);
      const maximumDate = dayjs('2002', dateFormat);
      const alwaysMaxRange = false;
      const range = 'P1Y';
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
      const newValue: TimeExtent = {start: dayjs(minimumDate, dateFormat).toDate(), end: dayjs(minimumDate, dateFormat).toDate()};

      const calculatedTimeExtent = service.createValidTimeExtent(
        timeSliderConfig,
        newValue,
        true,
        minimumDate.toDate(),
        maximumDate.toDate()
      );
      expect(dayjs(calculatedTimeExtent.start).diff(dayjs('2000', dateFormat).toDate())).toBe(0);
      expect(dayjs(calculatedTimeExtent.start).format(timeSliderConfig.dateFormat)).toBe('2000');
      expect(dayjs(calculatedTimeExtent.end).diff(dayjs('2001', dateFormat).toDate())).toBe(0);
      expect(dayjs(calculatedTimeExtent.end).format(timeSliderConfig.dateFormat)).toBe('2001');
    });
  });

  describe('createStops', () => {
    describe('using a layer source', () => {
      const dateFormat = 'YYYY-MM';
      const firstStop = '2000-01';
      const secondStop = '2000-01';
      const thirdStop = '2000-01';

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: '',
        maximumDate: '',
        alwaysMaxRange: false,
        sourceType: 'layer',
        source: {
          layers: [
            {layerName: 'layerOne', date: firstStop},
            {layerName: 'layerTwo', date: secondStop},
            {layerName: 'layerThree', date: thirdStop}
          ]
        }
      };

      it('should create the correct stops', () => {
        const stops = service.createStops(timeSliderConfig);
        expect(stops.length).toBe(3);
        expect(dayjs(stops[0]).diff(dayjs(firstStop, dateFormat))).toBe(0);
        expect(dayjs(stops[1]).diff(dayjs(secondStop, dateFormat))).toBe(0);
        expect(dayjs(stops[2]).diff(dayjs(thirdStop, dateFormat))).toBe(0);
      });
    });
    describe('using a parameter source', () => {
      describe('with a single time unit and a range', () => {
        const dateFormat = 'YYYY-MM';
        const minimumDate = dayjs('2000-01', dateFormat);
        const maximumDate = dayjs('2001-03', dateFormat);
        const alwaysMaxRange = false;
        const range = 'P1M'; // one month
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

        it('should create the correct stops', () => {
          const stops = service.createStops(timeSliderConfig);
          expect(stops.length).toBe(15);
          expect(dayjs(stops[0]).diff(dayjs(minimumDate, dateFormat))).toBe(0);
          expect(dayjs(stops[1]).diff(dayjs(minimumDate, dateFormat).add(1, 'month'))).toBe(0);
          expect(dayjs(stops[stops.length - 1]).diff(dayjs(maximumDate, dateFormat))).toBe(0);
        });
      });
      describe('with mixed time units', () => {
        const dateFormat = 'YYYY-MM';
        const minimumDate = dayjs('2000-01', dateFormat);
        const maximumDate = dayjs('2001-03', dateFormat);
        const parameterSource: TimeSliderParameterSource = {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: []
        };

        describe('and a range', () => {
          const range = 'P1M10D';
          const timeSliderConfig: TimeSliderConfiguration = {
            name: 'mockTimeSlider',
            dateFormat: dateFormat,
            minimumDate: minimumDate.format(dateFormat),
            maximumDate: maximumDate.format(dateFormat),
            alwaysMaxRange: false,
            range: range, // one month and 10 days
            minimalRange: undefined,
            sourceType: 'parameter',
            source: parameterSource
          };

          it('should create the correct stops', () => {
            const stops = service.createStops(timeSliderConfig);
            /*
              Difference between min/max date: 425d
              Duration: 1 month (~30.4d) and 10 days => Total: 40.4d
              425d / 40.4d ~ 10.5 => round down => 10 stops between
              10 stops + starting point + end point = 12 stops
             */
            const expectedNumberOfStops = 12;
            expect(stops.length).toBe(expectedNumberOfStops);
            expect(dayjs(stops[0]).diff(dayjs(minimumDate, dateFormat))).toBe(0);
            expect(dayjs(stops[1]).diff(dayjs(minimumDate, dateFormat).add(dayjs.duration(range)))).toBe(0);
            expect(dayjs(stops[stops.length - 1]).diff(dayjs(maximumDate, dateFormat))).toBe(0);
          });
        });
        describe('and no range', () => {
          const timeSliderConfig: TimeSliderConfiguration = {
            name: 'mockTimeSlider',
            dateFormat: dateFormat,
            minimumDate: minimumDate.format(dateFormat),
            maximumDate: maximumDate.format(dateFormat),
            alwaysMaxRange: false,
            range: undefined,
            minimalRange: undefined,
            sourceType: 'parameter',
            source: parameterSource
          };

          it('should create the correct stops', () => {
            const stops = service.createStops(timeSliderConfig);
            /*
              Difference between min/max date: 15 months
              Duration: 1 month (as the smallest time unit is a month)
              => 15 stops
             */
            const expectedNumberOfStops = 15;
            expect(stops.length).toBe(expectedNumberOfStops);
            expect(dayjs(stops[0]).diff(dayjs(minimumDate, dateFormat))).toBe(0);
            expect(dayjs(stops[1]).diff(dayjs(minimumDate, dateFormat).add(1, 'months'))).toBe(0);
            expect(dayjs(stops[stops.length - 1]).diff(dayjs(maximumDate, dateFormat))).toBe(0);
          });
        });
      });
    });
  });
});
