import {Injectable} from '@angular/core';
import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator.js';
import {Store} from '@ngrx/store';
import {selectSrsId} from '../../../state/map/reducers/map-config.reducer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {ConfigService} from '../../../shared/services/config.service';
import {GeometryUnion} from '@arcgis/core/unionTypes';

@Injectable({
  providedIn: 'root',
})
export class TransformationService {
  public projectionOperatorLoaded: boolean = false;
  private readonly defaultSrs: __esri.SpatialReference;
  private readonly srs$ = this.store.select(selectSrsId);
  private srs: __esri.SpatialReference | undefined;

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
  ) {
    this.defaultSrs = new SpatialReference({wkid: this.configService.mapConfig.defaultMapConfig.srsId});
    this.srs$.subscribe((srsId) => (this.srs = new SpatialReference({wkid: srsId})));
    projectOperator.load().then(() => {
      this.projectionOperatorLoaded = true;
    });
  }

  public transform<T extends GeometryUnion>(transformable: T): T {
    /**
     * Note: According to the docs, the geometry is not guaranteed to be simple and the SimplifyOperator should be used (e.g. by using
     * SimplifyOperator.isSimple() to check). However, SimplifyOperator.execute() might return nullish, which has further implications down
     * the road. Hence, we do not use this SimplifyOperator here for the time being and add the proper handling if issues arise.
     */
    return projectOperator.execute(transformable, this.srs ?? this.defaultSrs) as T;
  }
}
