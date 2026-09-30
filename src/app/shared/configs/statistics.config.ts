/* eslint-disable @typescript-eslint/naming-convention -- Keys are backend topic names. */

import {StatisticInfoQueryParameters} from '../models/gb3-api-generated.interfaces';

/**
 * The radius used when the statistics area is derived automatically, e.g. when switching from the feature to the statistics tab or
 * when a mobile user taps the map. It is also the initial value of the radius input in the panel.
 */
export const defaultStatisticsRadiusInMeters = 500;

/**
 * Guards against degenerate areas before querying the backend.
 */
export const minimumStatisticsRadiusInMeters = 1;
export const maximumStatisticsRadiusInMeters = 10000;

/**
 * Manual statistics-map list and queries until the topics API exposes this configuration.
 * Population remains unqueried until its numeric fields are known.
 */
export const statisticsMapQueries: Record<string, readonly Omit<StatisticInfoQueryParameters, 'geometry' | 'srid'>[]> = {
  StatBevoelkerungZH: [],
  StatBeschaeftigteZH: [{layer: 'stat-ent-p', field: ['anz_besch', 'anz_vzae', 'anz_ast'], statistic: 'sum'}],
};
