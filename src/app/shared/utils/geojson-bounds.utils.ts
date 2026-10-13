import {Geometry, Position} from 'geojson';

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Returns the combined bounds of every coordinate, including nested geometry collections. */
export function calculateBoundingBox(geometry: Geometry): BoundingBox | undefined {
  let bounds: BoundingBox | undefined;
  for (const position of extractPositions(geometry)) {
    if (position.length < 2) continue;
    const [x, y] = position;
    if (!bounds) {
      bounds = {minX: x, maxX: x, minY: y, maxY: y};
    } else {
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);
    }
  }
  return bounds;
}

function* extractPositions(geometry: Geometry): Generator<Position> {
  switch (geometry.type) {
    case 'Point':
      yield geometry.coordinates;
      break;
    case 'MultiPoint':
    case 'LineString':
      yield* geometry.coordinates;
      break;
    case 'MultiLineString':
    case 'Polygon':
      for (const ring of geometry.coordinates) yield* ring;
      break;
    case 'MultiPolygon':
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) yield* ring;
      }
      break;
    case 'GeometryCollection':
      for (const child of geometry.geometries) yield* extractPositions(child);
      break;
  }
}
