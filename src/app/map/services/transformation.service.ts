import {Injectable} from '@angular/core';
import * as projection from '@arcgis/core/geometry/projection';
import {Store} from '@ngrx/store';
import {selectSrs} from '../../core/state/map/reducers/map-configuration.reducer';
import {defaultSrs} from '../../shared/configs/map-configs';

@Injectable({
  providedIn: 'root'
})
export class TransformationService {
  private srs$ = this.store.select(selectSrs);
  private srs: __esri.SpatialReference | undefined;

  constructor(private readonly store: Store) {
    this.srs$.subscribe((val) => (this.srs = val));
  }

  public transform<T extends __esri.Geometry>(transformable: T): T {
    return projection.project(transformable, this.srs ?? defaultSrs) as T;
  }
}
