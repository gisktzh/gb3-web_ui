import {Observable, of} from 'rxjs';
import {ExternalServiceActiveMapItem} from 'src/app/map/models/external-service.model';
import {MapServiceType} from 'src/app/map/types/map-service.type';
import {MapLoaderService} from '../../map/interfaces/map-loader.service';
import {createExternalKmlMapItemMock, createExternalWmsMapItemMock} from './active-map-item-test.utils';

export class MapLoaderServiceMock implements MapLoaderService {
  public loadExternalService(url: string, mapServiceType: MapServiceType): Observable<ExternalServiceActiveMapItem> {
    switch (mapServiceType) {
      case 'wms':
        return of(createExternalWmsMapItemMock(url, 'title', []));
      case 'kml':
        return of(createExternalKmlMapItemMock(url, 'title', []));
    }
  }
}
