import {Injectable} from '@angular/core';
import * as projection from '@arcgis/core/geometry/projection';
import {Store} from '@ngrx/store';
import {selectSrs} from '../../core/state/map/reducers/map-configuration.reducer';
import {defaultMapConfig} from '../../shared/configs/map-config';

@Injectable({
  providedIn: 'root'
})
export class TransformationService {
  private readonly srs$ = this.store.select(selectSrs);
  private srs: __esri.SpatialReference | undefined;

  constructor(private readonly store: Store) {
    this.srs$.subscribe((val) => (this.srs = val));
  }

  public transform<T extends __esri.Geometry>(transformable: T): T {
    return projection.project(transformable, this.srs ?? defaultMapConfig.defaultSrs) as T;
  }
}
