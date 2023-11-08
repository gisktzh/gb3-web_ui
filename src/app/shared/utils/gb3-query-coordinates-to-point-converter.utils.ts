import {QueryCoordinates} from '../models/gb3-api-generated.interfaces';
import {PointWithSrs} from '../interfaces/geojson-types-with-srs.interface';
import {SupportedSrs, supportedSrsKeys} from '../types/supported-srs.type';

export class Gb3QueryCoordinatesToPointConverterUtils {
  /**
   * Converts the given query coordinates object to a point with a supported SRS - or `undefined` if the SRS isn't supported.
   */
  public static convertQueryCoordinatesToPointWithSrs(queryCoordinates: QueryCoordinates): PointWithSrs | undefined {
    const srs: SupportedSrs | undefined = supportedSrsKeys.find((supportedSrsKey) => supportedSrsKey === queryCoordinates.srid);
    if (!srs) {
      return undefined;
    }
    return {type: 'Point', coordinates: [queryCoordinates.x, queryCoordinates.y], srs};
  }
}
