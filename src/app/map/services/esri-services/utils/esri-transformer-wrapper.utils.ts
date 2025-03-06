import {arcgisToGeoJSON} from '@terraformer/arcgis';
import {GeometryObject} from 'geojson';
import {GeometryUnion} from '@arcgis/core/unionTypes';
import {SRSMissing} from '../errors/esri.errors';
import {isNullish} from '../type-guards/esri-nullish.type-guard';

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
export const silentArcgisToGeoJSON = (arcgis: GeometryUnion, idAttribute?: string) => {
  let transformedGeometry: GeometryObject;
  const originalConsoleWarn: (...data: unknown[]) => void = console.warn;

  try {
    console.warn = (...data: unknown[]) => {
      if (data.length > 0 && !(typeof data[0] === 'string' && data[0].startsWith(WARNING_TO_IGNORE_STARTS_WITH))) {
        originalConsoleWarn(...data);
      }
    };

    /**
     * Put away your pitchforks, this is (yet another) workaround for a limitation in the @terraformer/arcgis package. After the 4.32 SDK
     * update, we should use "GeometryUnion" instead of "Geometry" as a type. There are _slight_ differences regarding the WKID handling
     * (i.e. they are now nullish instead of just number|undefined). Until now, this was no issue.
     *
     * However, after some debugging, the @terraformer/arcgis _actually_ uses the wrong types: They import the Geometry type from the
     * arcgis-rest-js package, whose Geometry _coincidentally_ matched the old Geometry type from the arcgis package_. However, the new
     * GeometryUnion package has issues in that the WKID of the spatialReference can now be "NULL" instead of just "undefined".
     *
     * Furthermore, as a "side bug", it has been discovered that _if_ wkid is undefined, we get a very weird behaviour that leads to the
     * basemap disappearing and, as soon as _any_ interaction with the map is performed, it will raise a fatal error in the internal
     * transformation methods. So, as a fix, we now raise an error, which _should_ never happen, but if it does, it's better to know about
     * directly instead of having some obscure comment buried here - because I wasted _too much hours_ figuring out why this weird error
     * in the internal transformation methods happened. (╯°□°）╯︵ ┻━┻
     *
     * And, finally, _yes_, the typecast below is necessary because typescript cannot infer that due to our error, wkid will actually
     * always be set ¯\_(ツ)_/¯
     */
    if (isNullish(arcgis.spatialReference.wkid)) {
      throw new SRSMissing();
    }

    transformedGeometry = arcgisToGeoJSON(arcgis as GeometryUnion & {spatialReference: {wkid: number}}, idAttribute);
  } finally {
    console.warn = originalConsoleWarn;
  }

  return transformedGeometry;
};
