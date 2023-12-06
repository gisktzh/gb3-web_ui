import {MapServiceType} from '../types/map-service.type';
import {Observable} from 'rxjs';
import {ExternalServiceActiveMapItem} from '../models/external-service.model';

export interface MapLoaderService {
  loadExternalService(url: string, mapServiceType: MapServiceType): Observable<ExternalServiceActiveMapItem>;
}
