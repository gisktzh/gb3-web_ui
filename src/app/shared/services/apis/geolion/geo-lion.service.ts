import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {GeoLionGeodatenMetaInterface} from '../../../interfaces/geolion-geodaten-meta.interface';
import {RootObject as GeodatenMetaRootObject} from '../../../models/geolion-geodaten-meta-generated.interface';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoLionService extends BaseApiService {
  protected apiBaseUrl: string = this.configService.apiConfig.geoLion.baseUrl;
  private readonly geodatenMetaEndpoint: string = 'api/v2/getGeodatenmeta.json';

  public loadGeodatenMetaData(id: string): Observable<GeoLionGeodatenMetaInterface> {
    const requestUrl = this.createFullEndpointUrl(this.geodatenMetaEndpoint, [{key: 'giszhnr', value: id}]);

    return this.get<GeodatenMetaRootObject>(requestUrl);
  }

  private createFullEndpointUrl(endpoint: string, parameters: {key: string; value: string}[] = []): string {
    const url = new URL(`${this.apiBaseUrl}/${endpoint}`);

    if (parameters) {
      parameters.forEach(({key, value}) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }
}
