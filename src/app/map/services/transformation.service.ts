import {Injectable} from '@angular/core';
import * as projection from '@arcgis/core/geometry/projection';
import {Store} from '@ngrx/store';
import {selectSrsId} from '../../state/map/reducers/map-config.reducer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {ConfigService} from '../../shared/services/config.service';

@Injectable({
  providedIn: 'root'
})
export class TransformationService {
  private readonly defaultSrs: __esri.SpatialReference;
  private readonly srs$ = this.store.select(selectSrsId);
  private srs: __esri.SpatialReference | undefined;

  constructor(private readonly store: Store, private readonly configService: ConfigService) {
    this.defaultSrs = new SpatialReference({wkid: this.configService.mapConfig.defaultMapConfig.srsId});
    this.srs$.subscribe((srsId) => (this.srs = new SpatialReference({wkid: srsId})));
  }

  public transform<T extends __esri.Geometry>(transformable: T): T {
    return projection.project(transformable, this.srs ?? this.defaultSrs) as T;
  }
}
