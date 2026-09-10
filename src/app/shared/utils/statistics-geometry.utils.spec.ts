import {
  calculateAreaInSquareMeters,
  createCircle,
  deriveBoundingBoxCenter,
  deriveCircleFromGeometry,
  moveGeometryTo,
} from './statistics-geometry.utils';
import {PointWithSrs, PolygonWithSrs} from '../interfaces/geojson-types-with-srs.interface';

describe('statistics geometry utils', () => {
  const center: PointWithSrs = {type: 'Point', coordinates: [2683000, 1247000], srs: 2056};

  describe('createCircle', () => {
    it('creates a closed ring around the centre', () => {
      const circle = createCircle(center, 500);
      const ring = circle.coordinates[0];

      expect(circle.type).toBe('Polygon');
      expect(circle.srs).toBe(2056);
      expect(ring[0]).toEqual(ring[ring.length - 1]);
    });

    it('places every vertex at the given radius', () => {
      const circle = createCircle(center, 500);

      circle.coordinates[0].forEach(([x, y]) => {
        const distance = Math.sqrt((x - center.coordinates[0]) ** 2 + (y - center.coordinates[1]) ** 2);
        expect(distance).toBeCloseTo(500, 6);
      });
    });

    it('approximates the area of a circle', () => {
      const circle = createCircle(center, 500);

      // The polygon is inscribed in the circle, so its area is slightly smaller than the exact one.
      expect(calculateAreaInSquareMeters(circle)).toBeCloseTo(Math.PI * 500 ** 2, -4);
    });
  });

  describe('deriveCircleFromGeometry', () => {
    it('recovers the centre and the radius of a circle it created', () => {
      const derived = deriveCircleFromGeometry(createCircle(center, 500));

      expect(derived?.center.coordinates[0]).toBeCloseTo(center.coordinates[0], 6);
      expect(derived?.center.coordinates[1]).toBeCloseTo(center.coordinates[1], 6);
      expect(derived?.radiusInMeters).toBe(500);
    });

    it('returns undefined for a geometry without coordinates', () => {
      const empty: PolygonWithSrs = {type: 'Polygon', coordinates: [], srs: 2056};

      expect(deriveCircleFromGeometry(empty)).toBeUndefined();
    });
  });

  describe('deriveBoundingBoxCenter', () => {
    it('returns the centre of the bounding box', () => {
      const rectangle: PolygonWithSrs = {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 20],
            [10, 20],
            [10, 0],
            [0, 0],
          ],
        ],
        srs: 2056,
      };

      expect(deriveBoundingBoxCenter(rectangle)).toEqual({type: 'Point', coordinates: [5, 10], srs: 2056});
    });

    it('returns undefined for a geometry without coordinates', () => {
      const empty: PolygonWithSrs = {type: 'Polygon', coordinates: [], srs: 2056};

      expect(deriveBoundingBoxCenter(empty)).toBeUndefined();
    });
  });

  describe('moveGeometryTo', () => {
    const triangle: PolygonWithSrs = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [0, 30],
          [0, 0],
        ],
      ],
      srs: 2056,
    };

    it('places the centre of the bounding box on the given point', () => {
      const moved = moveGeometryTo(triangle, center);

      expect(deriveBoundingBoxCenter(moved)).toEqual(center);
    });

    it('keeps the shape and the size of the geometry', () => {
      const moved = moveGeometryTo(triangle, center);

      expect(calculateAreaInSquareMeters(moved)).toBe(calculateAreaInSquareMeters(triangle));
      expect(moved.coordinates[0]).toHaveLength(triangle.coordinates[0].length);
    });

    it('does not modify the original geometry', () => {
      moveGeometryTo(triangle, center);

      expect(triangle.coordinates[0][0]).toEqual([0, 0]);
    });

    it('returns the geometry unchanged if it has no coordinates to move', () => {
      const empty: PolygonWithSrs = {type: 'Polygon', coordinates: [], srs: 2056};

      expect(moveGeometryTo(empty, center)).toBe(empty);
    });
  });

  describe('calculateAreaInSquareMeters', () => {
    it('calculates the area of a square regardless of its winding order', () => {
      const square: PolygonWithSrs = {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 10],
            [10, 10],
            [10, 0],
            [0, 0],
          ],
        ],
        srs: 2056,
      };

      expect(calculateAreaInSquareMeters(square)).toBe(100);
    });

    it('subtracts interior rings', () => {
      const withHole: PolygonWithSrs = {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 10],
            [10, 10],
            [10, 0],
            [0, 0],
          ],
          [
            [2, 2],
            [2, 4],
            [4, 4],
            [4, 2],
            [2, 2],
          ],
        ],
        srs: 2056,
      };

      expect(calculateAreaInSquareMeters(withHole)).toBe(96);
    });

    it('returns zero for geometries that enclose no area', () => {
      expect(calculateAreaInSquareMeters(center)).toBe(0);
    });
  });
});
