import {MapServiceType} from '../types/map-service.type';
import {Observable} from 'rxjs';
import {ExternalServiceActiveMapItem} from '../models/external-service.model';

export interface MapLoaderService {
  /** loads an external service based on the given URL and returns a fully loaded active map item */
  loadExternalService(url: string, mapServiceType: MapServiceType): Observable<ExternalServiceActiveMapItem>;
}
