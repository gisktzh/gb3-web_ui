import {SupportedSrs} from '../../shared/types/supported-srs';
import {
  LineStringWithSrs,
  MultiLineStringWithSrs,
  MultiPointWithSrs,
  MultiPolygonWithSrs,
  PointWithSrs,
  PolygonWithSrs,
} from '../../shared/interfaces/geojson-types-with-srs.interface';

export class MinimalGeometriesUtils {
  public static getMinimalPolygon(srs: SupportedSrs): PolygonWithSrs {
    return {
      type: 'Polygon',
      coordinates: [
        [
          [100.0, 0.0],
          [101.0, 0.0],
          [101.0, 1.0],
          [100.0, 1.0],
          [100.0, 0.0],
        ],
        [
          [100.8, 0.8],
          [100.8, 0.2],
          [100.2, 0.2],
          [100.2, 0.8],
          [100.8, 0.8],
        ],
      ],
      srs: srs,
    };
  }

  public static getMinimalMultiPolygon(srs: SupportedSrs): MultiPolygonWithSrs {
    // Represents a minimal polygon with an interior ring and a polygon without a ring, as MultiPolygon
    return {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [102.0, 2.0],
            [103.0, 2.0],
            [103.0, 3.0],
            [102.0, 3.0],
            [102.0, 2.0],
          ],
        ],
        [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
          [
            [100.2, 0.2],
            [100.2, 0.8],
            [100.8, 0.8],
            [100.8, 0.2],
            [100.2, 0.2],
          ],
        ],
      ],
      srs: srs,
    };
  }

  public static getMinimalLineString(srs: SupportedSrs): LineStringWithSrs {
    return {
      type: 'LineString',
      coordinates: [
        [100.0, 0.0],
        [101.0, 1.0],
      ],
      srs: srs,
    };
  }

  public static getMinimalMultiLineString(srs: SupportedSrs): MultiLineStringWithSrs {
    return {
      type: 'MultiLineString',
      coordinates: [
        [
          [100.0, 0.0],
          [101.0, 1.0],
        ],
        [
          [102.0, 2.0],
          [103.0, 3.0],
        ],
      ],
      srs: srs,
    };
  }

  public static getMinimalPoint(srs: SupportedSrs): PointWithSrs {
    return {type: 'Point', coordinates: [48.0, 8.0], srs: srs};
  }

  public static getMinimalMultiPoint(srs: SupportedSrs): MultiPointWithSrs {
    return {
      type: 'MultiPoint',
      coordinates: [
        [48.0, 8.0],
        [49.0, 9.0],
      ],
      srs: srs,
    };
  }
}
