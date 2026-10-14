import {Injectable} from '@angular/core';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geodeticAreaOperator from '@arcgis/core/geometry/operators/geodeticAreaOperator.js';
import {defer, from, map, Observable, of} from 'rxjs';
import {GeometryWithSrs} from '../interfaces/geojson-types-with-srs.interface';
import {calculateAreaInSquareMeters} from '../utils/statistics-geometry.utils';

@Injectable({providedIn: 'root'})
export class StatisticsAreaService {
  public calculateArea(geometry: GeometryWithSrs): Observable<number> {
    return defer(() => {
      if (geometry.type !== 'Polygon') {
        throw new Error(`Unsupported statistics geometry: ${geometry.type}. Expected a Polygon.`);
      }
      const area =
        geometry.srs === 2056
          ? of(calculateAreaInSquareMeters(geometry))
          : from(geodeticAreaOperator.load()).pipe(
              map(() =>
                geometry.coordinates.reduce((total, ring, index) => {
                  const polygon = new Polygon({rings: [ring], spatialReference: {wkid: geometry.srs}});
                  const ringArea = Math.abs(geodeticAreaOperator.execute(polygon, {unit: 'square-meters'}));
                  return index === 0 ? total + ringArea : total - ringArea;
                }, 0),
              ),
            );
      return area.pipe(
        map((squareMeters) => {
          if (!Number.isFinite(squareMeters) || squareMeters <= 0) {
            throw new Error('The statistics selection must enclose a finite, positive area.');
          }
          return squareMeters;
        }),
      );
    });
  }
}
