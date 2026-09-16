import {MapConstants} from '../../shared/constants/map.constants';
import {MapViewPadding} from '../../shared/interfaces/map-view-padding.interface';

interface MapViewPaddingOptions {
  basePadding: MapViewPadding;
  isEnabled: boolean;
  isUiHidden: boolean;
  isLegendVisible: boolean;
  legendWidth: number | undefined;
  isRightSideBarVisible: boolean;
  rightSideBarWidth: number | undefined;
  viewportWidth: number;
}

const NO_VIEW_PADDING: MapViewPadding = {top: 0, right: 0, bottom: 0, left: 0};

export function calculateMapViewPadding({
  basePadding,
  isEnabled,
  isUiHidden,
  isLegendVisible,
  legendWidth,
  isRightSideBarVisible,
  rightSideBarWidth,
  viewportWidth,
}: MapViewPaddingOptions): MapViewPadding {
  if (!isEnabled || isUiHidden) {
    return {...NO_VIEW_PADDING};
  }

  const effectiveLegendWidth = legendWidth ?? MapConstants.DEFAULT_MAP_OVERLAY_WIDTH;
  const effectiveRightSideBarWidth = rightSideBarWidth ?? MapConstants.DEFAULT_MAP_OVERLAY_WIDTH;

  const desiredLeft = isLegendVisible
    ? Math.max(basePadding.left, effectiveLegendWidth + MapConstants.MAP_OVERLAY_VIEW_PADDING)
    : basePadding.left;
  const desiredRight = isRightSideBarVisible
    ? Math.max(basePadding.right, effectiveRightSideBarWidth + MapConstants.MAP_OVERLAY_VIEW_PADDING)
    : basePadding.right;
  const left = Math.min(desiredLeft, Math.max(0, viewportWidth - 1));
  const right = Math.min(desiredRight, Math.max(0, viewportWidth - left - 1));

  return {...basePadding, left, right};
}
