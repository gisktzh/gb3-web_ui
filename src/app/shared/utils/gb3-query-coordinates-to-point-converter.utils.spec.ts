import {QueryCoordinates} from '../models/gb3-api-generated.interfaces';
import {Gb3QueryCoordinatesToPointConverterUtils} from './gb3-query-coordinates-to-point-converter.utils';
import {PointWithSrs} from '../interfaces/geojson-types-with-srs.interface';
import {UnsupportedSrs} from '../errors/unsupported-srs.errors';

describe('Gb3QueryCoordinatesToPointConverterUtils', () => {
  it('should convert query coordinates with supported srs to a point', () => {
    const queryCoordinates: QueryCoordinates = {
      x: 1337,
      y: 42,
      srid: 2056,
    };
    const actual = Gb3QueryCoordinatesToPointConverterUtils.convertQueryCoordinatesToPointWithSrs(queryCoordinates);
    const expected: PointWithSrs = {type: 'Point', coordinates: [queryCoordinates.x, queryCoordinates.y], srs: 2056};
    expect(actual).toEqual(expected);
  });

  it('should throw an error for query coordinates with unsupported srs', () => {
    const queryCoordinates: QueryCoordinates = {
      x: 1337,
      y: 42,
      srid: 666,
    };
    expect(() => Gb3QueryCoordinatesToPointConverterUtils.convertQueryCoordinatesToPointWithSrs(queryCoordinates)).toThrow(
      new UnsupportedSrs(queryCoordinates.srid),
    );
  });
});
