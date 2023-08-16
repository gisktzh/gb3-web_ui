import {selectFavouriteBaseConfig} from './favourite-base-config.selector';
import {MapConfigState} from '../states/map-config.state';

import {FavouriteBaseConfig} from '../../../shared/interfaces/favourite.interface';

describe('selectFavouriteBaseConfig', () => {
  let basicMockState: MapConfigState;
  beforeEach(() => {
    basicMockState = {
      center: {x: 42, y: 1337},
      activeBasemapId: 'testBaseMapId',
      scale: 9001,
      initialMaps: [],
      isMaxZoomedIn: true,
      isMaxZoomedOut: false,
      ready: true,
      scaleSettings: {maxScale: 1_000_000, minScale: 10_000, calculatedMaxScale: 25, calculatedMinScale: 26},
      srsId: 2056,
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
