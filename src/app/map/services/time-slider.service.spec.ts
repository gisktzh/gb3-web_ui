import {TestBed} from '@angular/core/testing';
import {TimeSliderService} from './time-slider.service';
import dayjs from 'dayjs';
import {TimeSliderConfiguration, TimeSliderParameterSource} from '../../shared/interfaces/topic.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {DayjsUtils} from '../../shared/utils/dayjs.utils';

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
      const minimumDate = DayjsUtils.getDateAsString(DayjsUtils.getDate('2000-01', dateFormat), dateFormat);
      const maximumDate = DayjsUtils.getDateAsString(DayjsUtils.getDate('2001-03', dateFormat), dateFormat);
      const alwaysMaxRange = true;
      const range = undefined;
      const minimalRange = undefined;

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate,
        maximumDate,
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: [],
        },
      };

      it('should create always the same time extent using min-/max values', () => {
        const newValue: TimeExtent = {
          start: DayjsUtils.getDate('2000-02', dateFormat),
          end: DayjsUtils.getDate('2000-03', dateFormat),
        };

        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          DayjsUtils.getDate(minimumDate),
          DayjsUtils.getDate(maximumDate),
        );
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate(minimumDate))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate(maximumDate))).toBe(0);
      });
    });
    describe('using "range"', () => {
      const dateFormat = 'YYYY-MM';
      const minimumDate = DayjsUtils.getDate('2000-01', dateFormat);
      const maximumDate = DayjsUtils.getDate('2001-03', dateFormat);
      const minimumDateString = DayjsUtils.getDateAsString(minimumDate, dateFormat);
      const maximumDateString = DayjsUtils.getDateAsString(maximumDate, dateFormat);

      const alwaysMaxRange = false;
      const range = 'P1M';
      const minimalRange = undefined;

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: minimumDateString,
        maximumDate: maximumDateString,
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: [],
        },
      };

      it('should not create a new time extent if it is already valid', () => {
        const newValue: TimeExtent = {
          start: DayjsUtils.getDate('2000-02', dateFormat),
          end: DayjsUtils.getDate('2000-03', dateFormat),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          DayjsUtils.getDate(minimumDateString),
          DayjsUtils.getDate(maximumDateString),
        );
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, newValue.start)).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, newValue.end)).toBe(0);
      });

      it('should create a new end date if it is valid', () => {
        const newValue: TimeExtent = {start: maximumDate, end: minimumDate};
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate('2001-03', dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate('2001-04', dateFormat))).toBe(0);
      });

      it('should create a new start date if it is smaller than the minimum date', () => {
        const newValue: TimeExtent = {start: DayjsUtils.subtractDuration(minimumDate, DayjsUtils.getDuration('P1M')), end: minimumDate};
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate('2000-01', dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate('2000-02', dateFormat))).toBe(0);
      });

      it('should create a new start date if it is bigger than the maximum date', () => {
        const newValue: TimeExtent = {start: DayjsUtils.addDuration(maximumDate, DayjsUtils.getDuration('P1M')), end: minimumDate};
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate('2001-03', dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate('2001-04', dateFormat))).toBe(0);
      });
    });
    describe('using "minimalRange"', () => {
      const dateFormat = 'YYYY-MM';
      const minimumDate = DayjsUtils.getDate('2000-01', dateFormat);
      const maximumDate = DayjsUtils.getDate('2001-03', dateFormat);
      const minimumDateString = DayjsUtils.getDateAsString(minimumDate, dateFormat);
      const maximumDateString = DayjsUtils.getDateAsString(maximumDate, dateFormat);
      const alwaysMaxRange = false;
      const range = undefined;
      const minimalRange = 'P2M';

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: minimumDateString,
        maximumDate: maximumDateString,
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: [],
        },
      };

      it('should not create a new time extent if it is already valid', () => {
        const newValue: TimeExtent = {
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-05', dateFormat).toDate(),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, newValue.start)).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, newValue.end)).toBe(0);
      });

      it('should create a new start/end date if it is over/under the limits', () => {
        const newValue: TimeExtent = {
          start: dayjs('1999-12', dateFormat).toDate(),
          end: dayjs('2001-04', dateFormat).toDate(),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, minimumDate)).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, maximumDate)).toBe(0);
      });

      it('should adjust the start date if the new start date is too close to the original start date', () => {
        const newValue: TimeExtent = {
          start: dayjs('2000-03', dateFormat).toDate(),
          end: dayjs('2000-04', dateFormat).toDate(),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate('2000-02', dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate('2000-04', dateFormat))).toBe(0);
      });

      it('should adjust the end date if the new end date is too close to the original end date', () => {
        const newValue: TimeExtent = {
          start: dayjs('2000-02', dateFormat).toDate(),
          end: dayjs('2000-03', dateFormat).toDate(),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, false, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate('2000-02', dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate('2000-04', dateFormat))).toBe(0);
      });

      it('should create a new start date if if is too close to the end date and the end date is the maximum possible date', () => {
        const newValue: TimeExtent = {
          start: dayjs('2001-02', dateFormat).toDate(),
          end: dayjs('2001-03', dateFormat).toDate(),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate('2001-01', dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate('2001-03', dateFormat))).toBe(0);
      });
    });

    it('should use the correct range in case of years', () => {
      const dateFormat = 'YYYY';
      const minimumDate = DayjsUtils.getDate('2000-01', dateFormat);
      const maximumDate = DayjsUtils.getDate('2001-03', dateFormat);
      const minimumDateString = DayjsUtils.getDateAsString(minimumDate, dateFormat);
      const maximumDateString = DayjsUtils.getDateAsString(maximumDate, dateFormat);
      const alwaysMaxRange = false;
      const range = 'P1Y';
      const minimalRange = undefined;

      const timeSliderConfig: TimeSliderConfiguration = {
        name: 'mockTimeSlider',
        dateFormat: dateFormat,
        minimumDate: minimumDateString,
        maximumDate: maximumDateString,
        alwaysMaxRange: alwaysMaxRange,
        range: range,
        minimalRange: minimalRange,
        sourceType: 'parameter',
        source: {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: [],
        },
      };
      const newValue: TimeExtent = {
        start: DayjsUtils.getDate(minimumDateString, dateFormat),
        end: DayjsUtils.getDate(minimumDateString, dateFormat),
      };

      const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
      expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.start, DayjsUtils.getDate('2000', dateFormat))).toBe(0);
      expect(DayjsUtils.getDateAsString(calculatedTimeExtent.start, timeSliderConfig.dateFormat)).toBe('2000');
      expect(DayjsUtils.calculateDifferenceBetweenDates(calculatedTimeExtent.end, DayjsUtils.getDate('2001', dateFormat))).toBe(0);
      expect(DayjsUtils.getDateAsString(calculatedTimeExtent.end, timeSliderConfig.dateFormat)).toBe('2001');
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
            {layerName: 'layerThree', date: thirdStop},
          ],
        },
      };

      it('should create the correct stops', () => {
        const stops = service.createStops(timeSliderConfig);
        expect(stops.length).toBe(3);
        expect(DayjsUtils.calculateDifferenceBetweenDates(stops[0], DayjsUtils.parseUTCDate(firstStop, dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(stops[1], DayjsUtils.parseUTCDate(secondStop, dateFormat))).toBe(0);
        expect(DayjsUtils.calculateDifferenceBetweenDates(stops[2], DayjsUtils.parseUTCDate(thirdStop, dateFormat))).toBe(0);
      });
    });
    describe('using a parameter source', () => {
      describe('with a single time unit and a range', () => {
        const dateFormat = 'YYYY-MM';
        const minimumDate = DayjsUtils.getDate('2000-01', dateFormat);
        const maximumDate = DayjsUtils.getDate('2001-03', dateFormat);
        const minimumDateString = DayjsUtils.getDateAsString(minimumDate, dateFormat);
        const maximumDateString = DayjsUtils.getDateAsString(maximumDate, dateFormat);
        const alwaysMaxRange = false;
        const range = 'P1M'; // one month
        const minimalRange = undefined;

        const timeSliderConfig: TimeSliderConfiguration = {
          name: 'mockTimeSlider',
          dateFormat: dateFormat,
          minimumDate: minimumDateString,
          maximumDate: maximumDateString,
          alwaysMaxRange: alwaysMaxRange,
          range: range,
          minimalRange: minimalRange,
          sourceType: 'parameter',
          source: {
            startRangeParameter: '',
            endRangeParameter: '',
            layerIdentifiers: [],
          },
        };

        it('should create the correct stops', () => {
          const stops = service.createStops(timeSliderConfig);
          expect(stops.length).toBe(15);
          expect(DayjsUtils.calculateDifferenceBetweenDates(stops[0], DayjsUtils.parseUTCDate('2000-01', dateFormat))).toBe(0);
          expect(DayjsUtils.calculateDifferenceBetweenDates(stops[1], DayjsUtils.parseUTCDate('2000-02', dateFormat))).toBe(0);
          expect(DayjsUtils.calculateDifferenceBetweenDates(stops[stops.length - 1], DayjsUtils.parseUTCDate('2001-03', dateFormat))).toBe(
            0,
          );
        });
      });
      describe('with mixed time units', () => {
        const dateFormat = 'YYYY-MM';
        const minimumDate = DayjsUtils.parseUTCDate('2000-01', dateFormat);
        const maximumDate = DayjsUtils.parseUTCDate('2001-03', dateFormat);
        const parameterSource: TimeSliderParameterSource = {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: [],
        };

        describe('and a range', () => {
          const range = 'P1M10D';
          const timeSliderConfig: TimeSliderConfiguration = {
            name: 'mockTimeSlider',
            dateFormat: dateFormat,
            minimumDate: DayjsUtils.getUTCDateAsString(minimumDate, dateFormat),
            maximumDate: DayjsUtils.getUTCDateAsString(maximumDate, dateFormat),
            alwaysMaxRange: false,
            range: range, // one month and 10 days
            minimalRange: undefined,
            sourceType: 'parameter',
            source: parameterSource,
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
            expect(DayjsUtils.calculateDifferenceBetweenDates(stops[0], minimumDate)).toBe(0);
            expect(
              DayjsUtils.calculateDifferenceBetweenDates(stops[1], DayjsUtils.addDuration(minimumDate, DayjsUtils.getDuration(range))),
            ).toBe(0);
            expect(DayjsUtils.calculateDifferenceBetweenDates(stops[stops.length - 1], maximumDate)).toBe(0);
          });
        });
        describe('and no range', () => {
          const timeSliderConfig: TimeSliderConfiguration = {
            name: 'mockTimeSlider',
            dateFormat: dateFormat,
            minimumDate: DayjsUtils.getUTCDateAsString(minimumDate, dateFormat),
            maximumDate: DayjsUtils.getUTCDateAsString(maximumDate, dateFormat),
            alwaysMaxRange: false,
            range: undefined,
            minimalRange: undefined,
            sourceType: 'parameter',
            source: parameterSource,
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

            expect(DayjsUtils.calculateDifferenceBetweenDates(stops[0], DayjsUtils.parseUTCDate('2000-01', dateFormat))).toBe(0);
            expect(DayjsUtils.calculateDifferenceBetweenDates(stops[1], DayjsUtils.parseUTCDate('2000-02', dateFormat))).toBe(0);
            expect(
              DayjsUtils.calculateDifferenceBetweenDates(stops[stops.length - 1], DayjsUtils.parseUTCDate('2001-03', dateFormat)),
            ).toBe(0);
          });
        });
      });
    });
  });
});
