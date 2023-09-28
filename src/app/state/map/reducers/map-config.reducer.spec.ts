import {initialState as defaultMapConfigState, reducer} from './map-config.reducer';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapConfigState} from '../states/map-config.state';
import {MapConstants} from '../../../shared/constants/map.constants';

describe('MapConfig Reducer', () => {
  describe('setMapExtent', () => {
    const initialState: MapConfigState = {
      ...defaultMapConfigState,
      scaleSettings: {
        calculatedMinScale: 200,
        calculatedMaxScale: 100,
        minScale: 200,
        maxScale: 100,
      },
    };

    describe('zoomedIn calculation', () => {
      describe('should be true for values around (possibly rounded) or below MAXIMUM_MAP_SCALE', () => {
        [
          {value: MapConstants.MAXIMUM_MAP_SCALE + 0.1},
          {value: MapConstants.MAXIMUM_MAP_SCALE + 0.4},
          {value: MapConstants.MAXIMUM_MAP_SCALE - 0.1},
          {value: MapConstants.MAXIMUM_MAP_SCALE},
        ].forEach(({value}) => {
          it(`maxZoomedIn is true for scale === ${value}`, () => {
            const actionFloored = MapConfigActions.setMapExtent({scale: value, x: 2400000, y: 1200000});

            const {isMaxZoomedIn} = reducer(initialState, actionFloored);

            expect(isMaxZoomedIn).toBe(true);
          });
        });
      });
      describe('should be false for values above (possibly rounded) MAXIMUM_MAP_SCALE', () => {
        [{value: MapConstants.MAXIMUM_MAP_SCALE + 0.5}, {value: MapConstants.MAXIMUM_MAP_SCALE + 5}].forEach(({value}) => {
          it(`maxZoomedIn is false for scale === ${value}`, () => {
            const actionFloored = MapConfigActions.setMapExtent({scale: value, x: 2400000, y: 1200000});

            const {isMaxZoomedIn} = reducer(initialState, actionFloored);

            expect(isMaxZoomedIn).toBe(false);
          });
        });
      });
    });

    describe('zoomedOut calculation', () => {
      describe('should be true for values around calculatedMinScale', () => {
        [{value: 199.9}, {value: 199.1}, {value: 200.0}, {value: 200.1}].forEach(({value}) => {
          it(`maxZoomedIn is true for scale === ${value}`, () => {
            const actionFloored = MapConfigActions.setMapExtent({scale: value, x: 2400000, y: 1200000});

            const {isMaxZoomedOut} = reducer(initialState, actionFloored);

            expect(isMaxZoomedOut).toBe(true);
          });
        });
      });
      describe('should be false for values below calculatedMinScale', () => {
        [{value: 199.0}, {value: 198.9}, {value: 0}, {value: -1}].forEach(({value}) => {
          it(`maxZoomedIn is false for scale === ${value}`, () => {
            const actionFloored = MapConfigActions.setMapExtent({scale: value, x: 2400000, y: 1200000});

            const {isMaxZoomedOut} = reducer(initialState, actionFloored);

            expect(isMaxZoomedOut).toBe(false);
          });
        });
      });
    });
  });
});
