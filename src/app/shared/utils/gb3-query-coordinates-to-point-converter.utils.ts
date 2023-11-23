import {QueryCoordinates} from '../models/gb3-api-generated.interfaces';
import {PointWithSrs} from '../interfaces/geojson-types-with-srs.interface';
import {SupportedSrs, supportedSrsKeys} from '../types/supported-srs.type';
import {UnsupportedSrs} from '../errors/unsupported-srs.errors';

export class Gb3QueryCoordinatesToPointConverterUtils {
  /**
   * Converts the given query coordinates object to a point with a supported SRS - or throws an error of type `UnsupportedSrs` if the SRS isn't supported.
   */
  public static convertQueryCoordinatesToPointWithSrs(queryCoordinates: QueryCoordinates): PointWithSrs {
    const srs: SupportedSrs | undefined = supportedSrsKeys.find((supportedSrsKey) => supportedSrsKey === queryCoordinates.srid);
    if (!srs) {
      throw new UnsupportedSrs(queryCoordinates.srid);
    }
    return {type: 'Point', coordinates: [queryCoordinates.x, queryCoordinates.y], srs};
  }
}
