/**
 * The radius used when the statistics area is derived automatically, e.g. when switching from the feature to the statistics tab or
 * when a mobile user taps the map. It is also the initial value of the radius input in the panel.
 */
export const defaultStatisticsRadiusInMeters = 500;

/**
 * Guards against degenerate areas. The backend additionally rejects areas that are too small for data-protection reasons and reports
 * this per layer via the 'areaTooSmall' status.
 */
export const minimumStatisticsRadiusInMeters = 1;
export const maximumStatisticsRadiusInMeters = 10000;
