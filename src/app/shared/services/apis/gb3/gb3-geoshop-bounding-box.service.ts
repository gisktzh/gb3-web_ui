import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {BboxGeoshop} from '../../../models/gb3-api-generated.interfaces';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';
import {map} from 'rxjs/operators';
import {HasBoundingBox} from '../../../interfaces/has-bounding-box.interface';

type GeoshopBbox = 'ZH' | 'CH';
enum BboxEndpoints {
  ZH = 'canton',
  CH = 'switzerland',
}

@Injectable({
  providedIn: 'root',
})
export class Gb3GeoshopBoundingBoxService extends Gb3ApiService {
  protected endpoint: BboxEndpoints = BboxEndpoints.ZH;

  public load(bbox: GeoshopBbox): Observable<HasBoundingBox> {
    switch (bbox) {
      case 'ZH':
        this.endpoint = BboxEndpoints.ZH;
        break;
      case 'CH':
        this.endpoint = BboxEndpoints.CH;
        break;
    }
    const bboxListData = this.get<BboxGeoshop>(this.getFullEndpointUrl());
    return bboxListData.pipe(map((data) => this.mapBboxListDataToBoundingBox(data)));
  }

  private mapBboxListDataToBoundingBox(data: BboxGeoshop): HasBoundingBox {
    return {
      boundingBox: ApiGeojsonGeometryToGb3ConverterUtils.castGeometryToSupportedGeometry(data.boundingbox),
    };
  }
}
