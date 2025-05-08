import {createSelector} from '@ngrx/store';
import {selectReferenceDistanceInMeters} from '../reducers/map-config.reducer';
import {MapConstants} from '../../../shared/constants/map.constants';
import {ScaleBarConfig} from '../../../shared/interfaces/scale-bar-config.interface';

/**
 * Caclulates the scale bar configuration based on the reference distance in meters. This is based on Leaflet's L.Control.Scale method, but
 * adapted to also add centimeter scale bars.
 *
 * The reference value has to be created using the MapConstants.MAX_SCALE_BAR_WIDTH_PX constant, so the calculated ratio is correct.
 */
export const selectScaleBarConfig = createSelector(
  selectReferenceDistanceInMeters,
  (referenceDistanceInMeters): ScaleBarConfig | undefined => {
    if (referenceDistanceInMeters === undefined) {
      return undefined;
    }

    /**
     * Updates the scale bar to meters by rounding to common scale values and calculating the correct ratio.
     * This is adapted from Leaflet's L.Control.Scale._getRoundNum method
     * (https://github.com/Leaflet/Leaflet/blob/main/src/control/Control.Scale.js#L117)
     */
    if (referenceDistanceInMeters >= 1) {
      const pow10 = Math.pow(10, `${Math.floor(referenceDistanceInMeters)}`.length - 1);
      let d = referenceDistanceInMeters / pow10;
      d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
      const meters = pow10 * d;
      const ratio = meters / referenceDistanceInMeters;

      return {
        scaleBarWidthInPx: Math.round(MapConstants.MAX_SCALE_BAR_WIDTH_PX * ratio),
        value: meters >= 1000 ? meters / 1000 : meters,
        unit: meters >= 1000 ? `km` : `m`,
      };
    }

    /**
     * Updates the scale bar to centimeters by finding the closest match and then calculating the ratio.
     */
    const breaks = [50, 20, 10, 5, 2, 1];
    const centimeters = Math.round(referenceDistanceInMeters * 100);
    const snappedCentimeter = breaks.find((b) => centimeters >= b) || 1;
    const ratio = snappedCentimeter / (referenceDistanceInMeters * 100);

    return {
      scaleBarWidthInPx: Math.round(MapConstants.MAX_SCALE_BAR_WIDTH_PX * ratio),
      value: snappedCentimeter,
      unit: 'cm',
    };
  },
);
