import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {CantonListData} from '../../../models/gb3-api-generated.interfaces';
import {CantonWithGeometry} from '../../../interfaces/gb3-geoshop-product.interface';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Gb3GeoshopCantonService extends Gb3ApiService {
  protected readonly endpoint = 'canton';

  public loadCanton(): Observable<CantonWithGeometry> {
    const cantonListData = this.get<CantonListData>(this.getFullEndpointUrl());
    return cantonListData.pipe(map((data) => this.mapCantonListDataToCanton(data)));
  }

  private mapCantonListDataToCanton(data: CantonListData): CantonWithGeometry {
    return {
      boundingBox: ApiGeojsonGeometryToGb3ConverterUtils.castGeometryToSupportedGeometry(data.boundingbox),
    };
  }
}
