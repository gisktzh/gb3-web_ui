import {MapConfigState} from '../states/map-config.state';
import {selectFavouriteBaseConfig} from './favourite-base-config.selector';

import {FavouriteBaseConfig} from '../../../shared/interfaces/favourite.interface';

describe('selectFavouriteBaseConfig', () => {
  let basicMockState: MapConfigState;
  beforeEach(() => {
    basicMockState = {
      isMapServiceInitialized: false,
      center: {x: 42, y: 1337},
      activeBasemapId: 'testBaseMapId',
      scale: 9001,
      rotation: 0,
      initialMaps: [],
      isMaxZoomedIn: true,
      isMaxZoomedOut: false,
      ready: true,
      scaleSettings: {maxScale: 1_000_000, minScale: 10_000, calculatedMaxScale: 25, calculatedMinScale: 26},
      srsId: 2056,
      predefinedInitialExtent: true,
      initialMapPaddingMobile: {left: 0, right: 0, top: 0, bottom: 0},
      initialMapPadding: {left: 0, right: 0, top: 0, bottom: 0},
      initialBoundingBox: {min: {x: 0, y: 0}, max: {x: 0, y: 0}},
      referenceDistanceInMeters: undefined,
    };
  });
  it('returns the correct subset of the current map config', () => {
    const actual = selectFavouriteBaseConfig.projector(basicMockState);

    const expected: FavouriteBaseConfig = {
      center: basicMockState.center,
      basemap: basicMockState.activeBasemapId,
      scale: basicMockState.scale,
    };
    expect(actual).toEqual(expected);
  });
});
