import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {SwitzerlandListData} from '../../../models/gb3-api-generated.interfaces';
import {FederationWithGeometry} from '../../../interfaces/gb3-geoshop-product.interface';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Gb3GeoshopFederationService extends Gb3ApiService {
  protected readonly endpoint = 'switzerland';

  public loadFederation(): Observable<FederationWithGeometry> {
    const federationListData = this.get<SwitzerlandListData>(this.getFullEndpointUrl());
    return federationListData.pipe(map((data) => this.mapFederationListDataToFederation(data)));
  }

  private mapFederationListDataToFederation(data: SwitzerlandListData): FederationWithGeometry {
    return {
      boundingBox: ApiGeojsonGeometryToGb3ConverterUtils.castGeometryToSupportedGeometry(data.boundingbox),
    };
  }
}
