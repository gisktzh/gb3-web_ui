import {GeometryWithSrs, PointWithSrs, PolygonWithSrs} from '../interfaces/geojson-types-with-srs.interface';
import {Position} from 'geojson';

/**
 * The number of segments used to approximate a circle as a polygon. High enough that the result looks round at any sensible map scale.
 */
const CIRCLE_SEGMENTS = 64;

/**
 * Creates a circular polygon around a centre point.
 *
 * All supported SRS are projected coordinate systems in metres (LV95/LV03), so a circle with a radius in metres is a plain Euclidean
 * circle and needs no geodesic calculation.
 */
export function createCircle(center: PointWithSrs, radiusInMeters: number): PolygonWithSrs {
  const [x, y] = center.coordinates;
  const ring: Position[] = [];

  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const angle = (i / CIRCLE_SEGMENTS) * 2 * Math.PI;
    ring.push([x + radiusInMeters * Math.cos(angle), y + radiusInMeters * Math.sin(angle)]);
  }
  ring.push(ring[0]);

  return {type: 'Polygon', coordinates: [ring], srs: center.srs};
}

/**
 * Derives the centre and radius of an area drawn with the circle tool. Esri hands the circle over as an approximating polygon, so both
 * values have to be recovered from its bounding box in order to keep the radius input in the panel in sync with the drawn area.
 */
export function deriveCircleFromGeometry(geometry: GeometryWithSrs): {center: PointWithSrs; radiusInMeters: number} | undefined {
  const positions = extractPositions(geometry);
  if (positions.length === 0) {
    return undefined;
  }

  const xs = positions.map(([x]) => x);
  const ys = positions.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    center: {type: 'Point', coordinates: [(minX + maxX) / 2, (minY + maxY) / 2], srs: geometry.srs},
    radiusInMeters: Math.round(Math.max(maxX - minX, maxY - minY) / 2),
  };
}

/**
 * Calculates the area of a polygonal geometry in square metres using the shoelace formula, subtracting any interior rings.
 */
export function calculateAreaInSquareMeters(geometry: GeometryWithSrs): number {
  switch (geometry.type) {
    case 'Polygon':
      return calculatePolygonArea(geometry.coordinates);
    case 'MultiPolygon':
      return geometry.coordinates.reduce((total, polygon) => total + calculatePolygonArea(polygon), 0);
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'GeometryCollection':
      return 0;
  }
}

function calculatePolygonArea(rings: Position[][]): number {
  return rings.reduce((total, ring, index) => {
    const ringArea = calculateRingArea(ring);
    return index === 0 ? total + ringArea : total - ringArea;
  }, 0);
}

function calculateRingArea(ring: Position[]): number {
  let doubledArea = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    doubledArea += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(doubledArea / 2);
}

function extractPositions(geometry: GeometryWithSrs): Position[] {
  switch (geometry.type) {
    case 'Point':
      return [geometry.coordinates];
    case 'MultiPoint':
    case 'LineString':
      return geometry.coordinates;
    case 'MultiLineString':
    case 'Polygon':
      return geometry.coordinates.flat();
    case 'MultiPolygon':
      return geometry.coordinates.flat(2);
    case 'GeometryCollection':
      return geometry.geometries.flatMap((child) => extractPositions({...child, srs: geometry.srs}));
  }
}
