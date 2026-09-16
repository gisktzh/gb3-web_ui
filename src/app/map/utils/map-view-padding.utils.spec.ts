import {MapConstants} from '../../shared/constants/map.constants';
import {calculateMapViewPadding} from './map-view-padding.utils';

describe('calculateMapViewPadding', () => {
  const basePadding = MapConstants.INITIAL_MAP_PADDING;

  const calculate = (overrides: Partial<Parameters<typeof calculateMapViewPadding>[0]> = {}): ReturnType<typeof calculateMapViewPadding> =>
    calculateMapViewPadding({
      basePadding,
      isEnabled: true,
      isUiHidden: false,
      isLegendVisible: false,
      legendWidth: undefined,
      isRightSideBarVisible: false,
      rightSideBarWidth: undefined,
      viewportWidth: 1920,
      ...overrides,
    });

  it('uses the base padding when only the map catalogue is visible', () => {
    expect(calculate()).toEqual(basePadding);
  });

  it('uses the default legend width without double-counting the map catalogue', () => {
    expect(calculate({isLegendVisible: true})).toEqual(basePadding);
  });

  it('uses a wider resized legend', () => {
    expect(calculate({isLegendVisible: true, legendWidth: 600})).toEqual({...basePadding, left: 612});
  });

  it('keeps the base padding for a narrower resized legend', () => {
    expect(calculate({isLegendVisible: true, legendWidth: 300})).toEqual(basePadding);
  });

  it('uses the default width of a visible right side bar', () => {
    expect(calculate({isRightSideBarVisible: true})).toEqual({...basePadding, right: 474});
  });

  it('uses a resized right side bar', () => {
    expect(calculate({isRightSideBarVisible: true, rightSideBarWidth: 512})).toEqual({...basePadding, right: 524});
  });

  it('keeps the base padding for a narrower resized right side bar', () => {
    expect(calculate({isRightSideBarVisible: true, rightSideBarWidth: 100})).toEqual(basePadding);
  });

  it('combines visible overlays on both sides independently', () => {
    expect(
      calculate({
        isLegendVisible: true,
        legendWidth: 600,
        isRightSideBarVisible: true,
        rightSideBarWidth: 512,
      }),
    ).toEqual({...basePadding, left: 612, right: 524});
  });

  it('returns no padding when the map UI is hidden', () => {
    expect(calculate({isUiHidden: true, isLegendVisible: true, isRightSideBarVisible: true})).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('returns no padding when padding is disabled, such as on mobile', () => {
    expect(calculate({isEnabled: false})).toEqual({top: 0, right: 0, bottom: 0, left: 0});
  });

  it('keeps a positive map viewport when both overlays exceed the available width', () => {
    expect(
      calculate({
        viewportWidth: 1024,
        isLegendVisible: true,
        legendWidth: 900,
        isRightSideBarVisible: true,
        rightSideBarWidth: 900,
      }),
    ).toEqual({...basePadding, left: 912, right: 111});
  });
});
