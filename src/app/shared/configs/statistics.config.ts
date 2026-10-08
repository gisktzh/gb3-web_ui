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
/** Test-phase limit while statistic_info returns all matching feature geometries; also enforce this in the backend. */
export const maximumStatisticsAreaInSquareMeters = 42_000_000;
export const maximumStatisticsRadiusInMeters = Math.floor(Math.sqrt(maximumStatisticsAreaInSquareMeters / Math.PI));

/**
 * Manual statistics-map list and queries until the topics API exposes this configuration.
 * The test layers currently share fields but may acquire separate field configurations.
 */
const statisticsFields = [
  'ganzwhg',
  'efh',
  'wohn_m_n',
  'geb_m_w',
  'mfh',
  'geb_o_w',
  'prov_geb',
  'andere_geb',
  'anz_einw',
  'anz_vzae',
  'anz_besch',
] as const;

export const statisticsMapQueries: Record<string, readonly Omit<StatisticInfoQueryParameters, 'geometry' | 'srid'>[]> = {
  StatBevoelkerungZH: [{layer: 'stat-bev-p', field: statisticsFields, statistic: 'sum'}],
  StatBeschaeftigteZH: [{layer: 'stat-ent-p', field: statisticsFields, statistic: 'sum'}],
  StatGebaeudeZH: [{layer: 'stat-geb-p', field: statisticsFields, statistic: 'sum'}],
};
