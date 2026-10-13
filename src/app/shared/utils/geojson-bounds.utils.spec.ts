import {Geometry} from 'geojson';
import {calculateBoundingBox} from './geojson-bounds.utils';

describe('calculateBoundingBox', () => {
  it('combines points, lines and polygons in nested collections, ignoring empty children', () => {
    const geometry: Geometry = {
      type: 'GeometryCollection',
      geometries: [
        {type: 'Point', coordinates: [10, 20, 100]},
        {type: 'MultiPoint', coordinates: []},
        {
          type: 'GeometryCollection',
          geometries: [
            {
              type: 'MultiLineString',
              coordinates: [
                [
                  [-5, 0],
                  [0, 30],
                ],
              ],
            },
            {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [0, -10],
                    [15, -10],
                    [0, -10],
                  ],
                ],
              ],
            },
          ],
        },
      ],
    };

    expect(calculateBoundingBox(geometry)).toEqual({minX: -5, maxX: 15, minY: -10, maxY: 30});
  });

  it('returns undefined for a collection containing only empty geometries', () => {
    expect(
      calculateBoundingBox({
        type: 'GeometryCollection',
        geometries: [
          {type: 'Point', coordinates: []},
          {type: 'Polygon', coordinates: []},
          {type: 'GeometryCollection', geometries: []},
        ],
      }),
    ).toBeUndefined();
  });

  it('handles aggregated results with more coordinates than can be spread into Math.min or Math.max', () => {
    const coordinates = Array.from({length: 150_000}, (_, index) => [index, index]);
    expect(calculateBoundingBox({type: 'MultiPoint', coordinates})).toEqual({minX: 0, maxX: 149_999, minY: 0, maxY: 149_999});
  });
});
