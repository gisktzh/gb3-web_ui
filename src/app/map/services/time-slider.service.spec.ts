import {TestBed} from '@angular/core/testing';
import {TimeSliderService} from './time-slider.service';
import {MapLayer, TimeSliderConfiguration, TimeSliderLayerSource, TimeSliderParameterSource} from '../../shared/interfaces/topic.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TimeService} from '../../shared/interfaces/time-service.interface';
import {TIME_SERVICE} from '../../app.tokens';

describe('TimeSliderService', () => {
  let service: TimeSliderService;
  let timeService: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeSliderService);
    timeService = TestBed.inject(TIME_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createValidTimeExtent', () => {
    describe('using "alwaysMaxRange"', () => {
      const dateFormat = 'YYYY-MM';
      const alwaysMaxRange = true;
      const range = undefined;
      const minimalRange = undefined;
      let minimumDate: string;
      let maximumDate: string;
      let timeSliderConfig: TimeSliderConfiguration;

      beforeEach(() => {
        minimumDate = timeService.getDateAsFormattedString(timeService.createDateFromString('2000-01', dateFormat), dateFormat);
        maximumDate = timeService.getDateAsFormattedString(timeService.createDateFromString('2001-03', dateFormat), dateFormat);
        timeSliderConfig = {
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
      });

      it('should create always the same time extent using min-/max values', () => {
        const newValue: TimeExtent = {
          start: timeService.createDateFromString('2000-02', dateFormat),
          end: timeService.createDateFromString('2000-03', dateFormat),
        };

        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          timeService.createDateFromString(minimumDate),
          timeService.createDateFromString(maximumDate),
        );
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString(minimumDate))).toBe(
          0,
        );
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString(maximumDate))).toBe(
          0,
        );
      });
    });

    describe('using "range"', () => {
      const dateFormat = 'YYYY-MM';
      const alwaysMaxRange = false;
      const range = 'P1M';
      const minimalRange = undefined;
      let minimumDate: Date;
      let maximumDate: Date;
      let minimumDateString: string;
      let maximumDateString: string;
      let timeSliderConfig: TimeSliderConfiguration;

      beforeEach(() => {
        minimumDate = timeService.createDateFromString('2000-01', dateFormat);
        maximumDate = timeService.createDateFromString('2001-03', dateFormat);
        minimumDateString = timeService.getDateAsFormattedString(minimumDate, dateFormat);
        maximumDateString = timeService.getDateAsFormattedString(maximumDate, dateFormat);
        timeSliderConfig = {
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
      });

      it('should not create a new time extent if it is already valid', () => {
        const newValue: TimeExtent = {
          start: timeService.createDateFromString('2000-02', dateFormat),
          end: timeService.createDateFromString('2000-03', dateFormat),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(
          timeSliderConfig,
          newValue,
          true,
          timeService.createDateFromString(minimumDateString),
          timeService.createDateFromString(maximumDateString),
        );
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, newValue.start)).toBe(0);
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, newValue.end)).toBe(0);
      });

      it('should create a new end date if it is valid', () => {
        const newValue: TimeExtent = {start: maximumDate, end: minimumDate};
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString('2001-03', dateFormat)),
        ).toBe(0);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString('2001-04', dateFormat)),
        ).toBe(0);
      });

      it('should create a new start date if it is smaller than the minimum date', () => {
        const newValue: TimeExtent = {start: timeService.subtractRangeFromDate(minimumDate, 'P1M'), end: minimumDate};
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString('2000-01', dateFormat)),
        ).toBe(0);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString('2000-02', dateFormat)),
        ).toBe(0);
      });

      it('should create a new start date if it is bigger than the maximum date', () => {
        const newValue: TimeExtent = {start: timeService.addRangeToDate(maximumDate, 'P1M'), end: minimumDate};
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString('2001-03', dateFormat)),
        ).toBe(0);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString('2001-04', dateFormat)),
        ).toBe(0);
      });
    });

    describe('using "minimalRange"', () => {
      const dateFormat = 'YYYY-MM';
      const alwaysMaxRange = false;
      const range = undefined;
      const minimalRange = 'P2M';
      let timeSliderConfig: TimeSliderConfiguration;
      let minimumDate: Date;
      let maximumDate: Date;
      let minimumDateString: string;
      let maximumDateString: string;

      beforeEach(() => {
        minimumDate = timeService.createDateFromString('2000-01', dateFormat);
        maximumDate = timeService.createDateFromString('2001-03', dateFormat);
        minimumDateString = timeService.getDateAsFormattedString(minimumDate, dateFormat);
        maximumDateString = timeService.getDateAsFormattedString(maximumDate, dateFormat);
        timeSliderConfig = {
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
      });

      it('should not create a new time extent if it is already valid', () => {
        const newValue: TimeExtent = {
          start: timeService.createDateFromString('2000-02', dateFormat),
          end: timeService.createDateFromString('2000-05', dateFormat),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, newValue.start)).toBe(0);
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, newValue.end)).toBe(0);
      });

      it('should create a new start/end date if it is over/under the limits', () => {
        const newValue: TimeExtent = {
          start: timeService.createDateFromString('1999-12', dateFormat),
          end: timeService.createDateFromString('2001-04', dateFormat),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, minimumDate)).toBe(0);
        expect(timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, maximumDate)).toBe(0);
      });

      it('should adjust the start date if the new start date is too close to the original start date', () => {
        const newValue: TimeExtent = {
          start: timeService.createDateFromString('2000-03', dateFormat),
          end: timeService.createDateFromString('2000-04', dateFormat),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString('2000-02', dateFormat)),
        ).toBe(0);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString('2000-04', dateFormat)),
        ).toBe(0);
      });

      it('should adjust the end date if the new end date is too close to the original end date', () => {
        const newValue: TimeExtent = {
          start: timeService.createDateFromString('2000-02', dateFormat),
          end: timeService.createDateFromString('2000-03', dateFormat),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, false, minimumDate, maximumDate);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString('2000-02', dateFormat)),
        ).toBe(0);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString('2000-04', dateFormat)),
        ).toBe(0);
      });

      it('should create a new start date if if is too close to the end date and the end date is the maximum possible date', () => {
        const newValue: TimeExtent = {
          start: timeService.createDateFromString('2001-02', dateFormat),
          end: timeService.createDateFromString('2001-03', dateFormat),
        };
        const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString('2001-01', dateFormat)),
        ).toBe(0);
        expect(
          timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString('2001-03', dateFormat)),
        ).toBe(0);
      });
    });

    it('should use the correct range in case of years', () => {
      const dateFormat = 'YYYY';
      const minimumDate = timeService.createDateFromString('2000-01', dateFormat);
      const maximumDate = timeService.createDateFromString('2001-03', dateFormat);
      const minimumDateString = timeService.getDateAsFormattedString(minimumDate, dateFormat);
      const maximumDateString = timeService.getDateAsFormattedString(maximumDate, dateFormat);
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
        start: timeService.createDateFromString(minimumDateString, dateFormat),
        end: timeService.createDateFromString(minimumDateString, dateFormat),
      };

      const calculatedTimeExtent = service.createValidTimeExtent(timeSliderConfig, newValue, true, minimumDate, maximumDate);
      expect(
        timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.start, timeService.createDateFromString('2000', dateFormat)),
      ).toBe(0);
      expect(timeService.getDateAsFormattedString(calculatedTimeExtent.start, timeSliderConfig.dateFormat)).toBe('2000');
      expect(
        timeService.calculateDifferenceBetweenDates(calculatedTimeExtent.end, timeService.createDateFromString('2001', dateFormat)),
      ).toBe(0);
      expect(timeService.getDateAsFormattedString(calculatedTimeExtent.end, timeSliderConfig.dateFormat)).toBe('2001');
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
        expect(timeService.calculateDifferenceBetweenDates(stops[0], timeService.createUTCDateFromString(firstStop, dateFormat))).toBe(0);
        expect(timeService.calculateDifferenceBetweenDates(stops[1], timeService.createUTCDateFromString(secondStop, dateFormat))).toBe(0);
        expect(timeService.calculateDifferenceBetweenDates(stops[2], timeService.createUTCDateFromString(thirdStop, dateFormat))).toBe(0);
      });
    });
    describe('using a parameter source', () => {
      describe('with a single time unit and a range', () => {
        it('should create the correct stops', () => {
          const dateFormat = 'YYYY-MM';
          const minimumDate = timeService.createDateFromString('2000-01', dateFormat);
          const maximumDate = timeService.createDateFromString('2001-03', dateFormat);
          const minimumDateString = timeService.getDateAsFormattedString(minimumDate, dateFormat);
          const maximumDateString = timeService.getDateAsFormattedString(maximumDate, dateFormat);
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
          const stops = service.createStops(timeSliderConfig);
          expect(stops.length).toBe(15);
          expect(timeService.calculateDifferenceBetweenDates(stops[0], timeService.createUTCDateFromString('2000-01', dateFormat))).toBe(0);
          expect(timeService.calculateDifferenceBetweenDates(stops[1], timeService.createUTCDateFromString('2000-02', dateFormat))).toBe(0);
          expect(
            timeService.calculateDifferenceBetweenDates(
              stops[stops.length - 1],
              timeService.createUTCDateFromString('2001-03', dateFormat),
            ),
          ).toBe(0);
        });
      });
      describe('with mixed time units', () => {
        const dateFormat = 'YYYY-MM';
        let minimumDate: Date;
        let maximumDate: Date;
        const parameterSource: TimeSliderParameterSource = {
          startRangeParameter: '',
          endRangeParameter: '',
          layerIdentifiers: [],
        };

        beforeEach(() => {
          minimumDate = timeService.createUTCDateFromString('2000-01', dateFormat);
          maximumDate = timeService.createUTCDateFromString('2001-03', dateFormat);
        });

        describe('and a range', () => {
          const range = 'P1M10D';
          let timeSliderConfig: TimeSliderConfiguration;

          beforeEach(() => {
            timeSliderConfig = {
              name: 'mockTimeSlider',
              dateFormat: dateFormat,
              minimumDate: timeService.getDateAsUTCString(minimumDate, dateFormat),
              maximumDate: timeService.getDateAsUTCString(maximumDate, dateFormat),
              alwaysMaxRange: false,
              range: range, // one month and 10 days
              minimalRange: undefined,
              sourceType: 'parameter',
              source: parameterSource,
            };
          });

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
            expect(timeService.calculateDifferenceBetweenDates(stops[0], minimumDate)).toBe(0);
            expect(timeService.calculateDifferenceBetweenDates(stops[1], timeService.addRangeToDate(minimumDate, range))).toBe(0);
            expect(timeService.calculateDifferenceBetweenDates(stops[stops.length - 1], maximumDate)).toBe(0);
          });
        });
        describe('and no range', () => {
          let timeSliderConfig: TimeSliderConfiguration;

          beforeEach(() => {
            timeSliderConfig = {
              name: 'mockTimeSlider',
              dateFormat: dateFormat,
              minimumDate: timeService.getDateAsUTCString(minimumDate, dateFormat),
              maximumDate: timeService.getDateAsUTCString(maximumDate, dateFormat),
              alwaysMaxRange: false,
              range: undefined,
              minimalRange: undefined,
              sourceType: 'parameter',
              source: parameterSource,
            };
          });

          it('should create the correct stops', () => {
            const stops = service.createStops(timeSliderConfig);
            /*
              Difference between min/max date: 15 months
              Duration: 1 month (as the smallest time unit is a month)
              => 15 stops
             */
            const expectedNumberOfStops = 15;
            expect(stops.length).toBe(expectedNumberOfStops);

            expect(timeService.calculateDifferenceBetweenDates(stops[0], timeService.createUTCDateFromString('2000-01', dateFormat))).toBe(
              0,
            );
            expect(timeService.calculateDifferenceBetweenDates(stops[1], timeService.createUTCDateFromString('2000-02', dateFormat))).toBe(
              0,
            );
            expect(
              timeService.calculateDifferenceBetweenDates(
                stops[stops.length - 1],
                timeService.createUTCDateFromString('2001-03', dateFormat),
              ),
            ).toBe(0);
          });
        });
      });
    });
  });

  describe('isLayerVisible', () => {
    it('returns `true` if a given layer is within the time extent', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'layer',
        source: {
          layers: [{layerName: 'layerName', date: '2023-06-30'}],
        } as TimeSliderLayerSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = true;
      const actual = service.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `false` if a given layer is outside the time extent', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'layer',
        source: {
          layers: [{layerName: 'layerName', date: '2024-01-01'}],
        } as TimeSliderLayerSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = false;
      const actual = service.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if there is no matching layer', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'layer',
        source: {
          layers: [{layerName: 'otherLayerName', date: '2023-06-15'}],
        } as TimeSliderLayerSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = undefined;
      const actual = service.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if it is not a layer based time slider configuration', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'parameter',
        source: {
          startRangeParameter: 'VON',
          endRangeParameter: 'BIS',
          layerIdentifiers: ['layerName'],
        } as TimeSliderParameterSource,
      } as TimeSliderConfiguration;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = undefined;
      const actual = service.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if the time slider configuration is undefined', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = undefined;
      const timeExtent: TimeExtent = {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      };

      const expected = undefined;
      const actual = service.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });

    it('returns `undefined` if the time extent is undefined', () => {
      const mapLayer = {layer: 'layerName', visible: false} as MapLayer;
      const timeSliderConfiguration = {
        dateFormat: 'YYYY-MM-DD',
        sourceType: 'parameter',
        source: {
          startRangeParameter: 'VON',
          endRangeParameter: 'BIS',
          layerIdentifiers: ['layerName'],
        } as TimeSliderParameterSource,
      } as TimeSliderConfiguration;
      const timeExtent = undefined;

      const expected = undefined;
      const actual = service.isLayerVisible(mapLayer, timeSliderConfiguration, timeExtent);

      expect(actual).toBe(expected);
    });
  });
});
