import {arcgisToGeoJSON} from '@terraformer/arcgis';
import {GeometryObject} from 'geojson';

const WARNING_TO_IGNORE_STARTS_WITH = 'Object converted in non-standard crs';

/**
 *  Wraps the arcgisToGeoJSON method from @terraformer/arcgis and prevents its hardcoded console.warn from being sent to the console.
 *
 *  The reason for this is that while *technically* GeoJSON *should* be in EPSG:4326, the specification *allows* for deviations if *all
 *  parties agree*. Now, @terraformer/arcgis does not seem to think very highly of that and as visible from the following issue, this
 *  will not be changed: https://github.com/terraformer-js/terraformer/issues/99
 *
 *  The workaround here does so by replacing the global `console.warn` object with a custom implementation, which filters all warning
 *  messages that start with `WARNING_TO_IGNORE_STARTS_WITH` (because it's actually ending in a dynamic string to make matters worse).
 *  All other warning will still be output; and at the end, the original `console.warn` is restored.
 *
 *  Yes, it's ugly, and yes, it might technically have sideeffects, yet the only window where they *could* happen is in the event of a
 *  finalized drawing, so the risk is minimal.
 */
export const silentArcgisToGeoJSON: typeof arcgisToGeoJSON = (arcgis, idAttribute) => {
  let transformedGeometry: GeometryObject;

  const originalConsoleWarn: (...data: unknown[]) => void = console.warn;
  console.warn = (...data: unknown[]) => {
    if (data.length > 0 && !(typeof data[0] === 'string' && data[0].startsWith(WARNING_TO_IGNORE_STARTS_WITH))) {
      originalConsoleWarn(...data);
    }
  };

  try {
    transformedGeometry = arcgisToGeoJSON(arcgis, idAttribute);
  } finally {
    console.warn = originalConsoleWarn;
  }

  return transformedGeometry;
};
