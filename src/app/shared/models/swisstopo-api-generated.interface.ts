/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Hand-crafted using the documentation at https://api3.geo.admin.ch/services/sdiservices.html; response types generated via
 * https://app.quicktype.io/
 */
import {LineString} from 'geojson';

type SupportedSrs = '2056' | '21781';
export interface ElevationProfileRequest {
  /**
   * A GeoJSON representation of a polyline (type = LineString). The LineString should not have more than PROFILE_MAX_AMOUNT_POINTS,
   * generally 5’000 coordinates.
   */
  geom: LineString;
  /**
   * The reference system to use (EPSG code). Valid value are 2056 (for LV95) and 21781 (for LV03). Strongly advised to set one, but if not
   * given, trying to guess which one to use.
   */
  sr: SupportedSrs;
  /**
   * The number of points used for the polyline segmentation. Default “200”.
   */
  nb_points?: number;
  /**
   * The offset value (INTEGER) in order to use the exponential moving algorithm . For a given value the offset value specify the number of
   * values before and after used to calculate the average.
   */
  offset?: number;
  /**
   * If True, it will ensure the coordinates given to the service are part of the response. Possible values are True or False, default to
   * False.
   */
  disting_points?: boolean;
  /**
   * Only available for profile.json. The name of the callback function.
   */
  callback?: string;
}

/**
 * Helper type, used as input for UrlSearchParams. The keys are given by the API, the type is string for all.
 */
type ElevationProfileRecord = Record<keyof ElevationProfileRequest, string>;

/**
 * Search params that are usable for the endpoint; only 'geom' is mandatory.
 */
export type ElevationProfileSearchParams = Partial<ElevationProfileRecord> & {geom: string; sr: SupportedSrs};

export interface ElevationProfileResponse {
  alts: ElevationProfileAltitude;
  dist: number;
  easting: number;
  northing: number;
}

/**
 * Contains the elevation (in m) for a given point in three different DTM qualities.
 */
export interface ElevationProfileAltitude {
  COMB: number;
  DTM2: number;
  DTM25: number;
}
